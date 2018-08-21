float distanceFromSine(vec2 uv, float frame) {
	float yValOfSineAtTheGivenPoint = sin(uv.x + frame) * 0.8;
	// return distance from sine
	return abs(uv.y - yValOfSineAtTheGivenPoint);
}

// // returns random number?
// float rand(float time) {
// 	int iterBetween09 = int(fract(time) * 10.0); // between 0-9
// 	int a = iterBetween09 * 456464564;
// 	float b = float(a / 13213);
// 	return fract(cos(b * time / 100.0) * b * 12.23 * pow(time, 8.0));
// }

float rand( float n )
{
    return fract(sin(n)*8785.32354);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    uv = uv * 2.0 - 1.0;

    uv.x = uv.x * iResolution.x / iResolution.y;

    // base color
    vec3 col = vec3(0.0,0.0,0.0);

    float dis = distanceFromSine(uv, float(iFrame) * 0.01) * 0.5;
    float colorBasedOnDistance = 0.5 - dis;
    //if(uv.x > 0.0) {
    	colorBasedOnDistance += (uv.x) * 0.1;
    //}

    // flash duration
    float flashDuration = 6.0;
    float noise = max((rand((float(iFrame) * 0.01)) * 0.05) * (uv.x + 2.0) * ((max(flashDuration - iTime, 0.2 * flashDuration)) / flashDuration), 0.0); // noise gradually decreases as time goes on
	col = vec3(colorBasedOnDistance + noise,0.0,0.0);


    // vec3 col = vec3(distanceFromSine(uv, iTime));

    // Output to screen
    fragColor = vec4(col,1.0);
}