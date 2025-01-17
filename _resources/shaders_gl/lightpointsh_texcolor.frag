// uniforms - used by the fragment shader
uniform sampler2D albedoTex;
uniform samplerCube shadowCubeMap;

uniform vec4 diffMaterial;
uniform vec4 specMaterial;		// rgb + shininess
uniform vec4 ambMaterial;
uniform vec4 attenLight;		// range1, range2, 0.0, 0.0

uniform vec4 lightPosW;
uniform vec4 eyePosW;

uniform float zNear;
uniform float zFar;

// input from vertex shader
varying vec4 v_PosW;
varying vec4 v_NormW;
varying vec2 v_TexCoord;

void main(void)
{
	vec4 diffLight = vec4(1.0, 1.0, 1.0, 1.0);
	vec4 specLight = vec4(1.0, 1.0, 1.0, 1.0);
	vec4 ambLight = vec4(0.25, 0.25, 0.25, 1.0);
	
	vec4 litColor = vec4(0.0, 0.0, 0.0, 1.0);
	
	vec4 albedoColor = texture2D(albedoTex, v_TexCoord);
	vec4 ambColor = ambMaterial * albedoColor * ambLight;
	
	float ld = length(lightPosW.xyz - v_PosW.xyz);		// light distance
	if( ld > attenLight.y )
	{
		gl_FragColor = ambColor;
		return;
	}
	
	vec3 normW = normalize(v_NormW.xyz);
	vec3 toLight = normalize(lightPosW.xyz - v_PosW.xyz);
	float diffFactor = max(0.0, dot(toLight, normW));
	
	if( diffFactor > 0.0 )
	{
		float atten = clamp( (attenLight.y - ld) / (attenLight.y - attenLight.x), 0.0, 1.0 );
		
		vec3 refl = normalize(reflect(-toLight, normW));
		vec3 toEye = normalize(eyePosW.xyz - v_PosW.xyz);
		float specFactor = pow(max(0.0, dot(toEye, refl)), specMaterial.a);
		
		// diffuse and specular terms
		litColor += atten * diffFactor * diffMaterial * albedoColor * diffLight;
		litColor += atten * specFactor * vec4(specMaterial.rgb, 1.0) * specLight;
	}

	vec4 shadowCoord = v_PosW - eyePosW;
	float depth = 2.0 * textureCube(shadowCubeMap, normalize(shadowCoord.xyz)).r - 1.0;
	depth +=  + 0.0001;

	float distanceFromLight = (2.0 * zNear) / (zFar + zNear - depth * (zFar - zNear));
	//float distanceFromLight = (zNear * zFar) / (zFar - depth * (zFar - zNear));

	float shadowFactor = distanceFromLight < length(shadowCoord.xyz) ? 0.0 : 1.0;

	gl_FragColor = ambColor + shadowFactor * litColor;
}