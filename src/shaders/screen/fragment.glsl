
const float PI = 3.1415926535897932384626433832795;
const float TAU = PI * 2.;


uniform vec2 uResolution;
uniform vec2 uMouse;


varying vec2 vUv;
varying float vTime;



float wiggly(float cx, float cy, float amplitude, float frequency, float spread){

  float w = sin(cx * amplitude * frequency * PI) * cos(cy * amplitude * frequency * PI) * spread;

  return w;
}




void coswarp(inout vec3 trip, float warpsScale ){

  trip.xyz += warpsScale * .1 * cos(3. * trip.yzx + (vTime * .25));
  trip.xyz += warpsScale * .05 * cos(11. * trip.yzx + (vTime * .25));
  trip.xyz += warpsScale * .025 * cos(17. * trip.yzx + (vTime * .25));

}





vec2 getRadialUv(vec2 uv) {
	float angle = atan(uv.x, -uv.y);
	angle = abs(angle);
	vec2 radialUv = vec2(0.0);
	radialUv.x = angle / (PI * 2.0) + 0.5;
	radialUv.y = 1.0 - pow(1.0 - length(uv), 4.0);
	return radialUv;
}


void uvRipple(inout vec2 uv, float intensity){

	vec2 p =-1.+2.*gl_FragCoord.xy / uResolution.xy-vec2(0,-.001);


    float cLength=length(p);

     uv= uv +(p/cLength)*cos(cLength*15.0-vTime*1.0)*intensity;

}

float box(vec2 _st, vec2 _size, float _smoothEdges){
    _size = vec2(0.5)-_size*0.5;
    vec2 aa = vec2(_smoothEdges*0.5);
    vec2 uv = smoothstep(_size,_size+aa,_st);
    uv *= smoothstep(_size,_size+aa,vec2(1.0)-_st);
    return uv.x*uv.y;
}


void main(){
  float alpha = 1.;
  vec2 uv = (gl_FragCoord.xy - uResolution * .5) / uResolution.yy ;

  float circle = step(distance(uv, uMouse), .3 + wiggly(vUv.x + vTime * .05, vUv.y + vTime * .05, 4., 2., 0.05));

  vec3 color = vec3(uv.x, uv.y, 1.);

  uvRipple(color.rg, .5);
  coswarp(color, 3.);

  color = mix(color, 1.-color, box(vUv, vec2(.95), .5));

  color = mix(color, vec3(uv.y, uv.x, 1.), box(vUv, vec2(.5), .5));

  alpha = 1.-circle;




 gl_FragColor =  vec4(color, alpha);

}
