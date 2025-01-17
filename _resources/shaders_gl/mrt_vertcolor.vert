// uniforms - used by the vertex shader
uniform mat4 u_MVPMat;
uniform mat4 u_MMat;

// attributes - input to the vertex shader
attribute vec4 a_Position0;
attribute vec4 a_Normal0;
attribute vec4 a_Color0;

// varying variables � input to the fragment shader
varying vec4 v_PosW;
varying vec4 v_NormW;
varying vec4 v_Col;

void main()
{
	// in most cases the matrices used are orthonormal and therefore can be used
	// to transform the vertex position and normal at the same time
	
	v_PosW = u_MMat * a_Position0;
	v_NormW = u_MMat * a_Normal0;
	v_Col = a_Color0;
	
	gl_Position = u_MVPMat * a_Position0;
}