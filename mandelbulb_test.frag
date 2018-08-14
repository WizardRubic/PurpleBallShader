/*
Mandelbulb
modification to the ray march program to ray march a mandelbulb fractal

TODO
add a mandelbulb function. probably put the values of r, theta, and phi into different functions
    this function should take in a value of c that's a 3d coordinate this time. v will start off at (0,0,0) again. 
    the mandelbulb function should prob start with power of 2 just to avoid complications. 
    

reuse the rest of the raymarching stuff from the other shader, remove the nonrelevant parts
*/


#define MAX_MARCHING_STEPS 250
#define EPSILON 0.0001
#define MAX_DISTANCE 100.0000000 
#define ARBITRARY_STEP_SIZE 0.08

float sceneSDF(vec3 p, int frame);

float getR(vec3 xyz){
    return pow(pow(xyz.x, 2.0) + pow(xyz.y, 2.0) + pow(xyz.z, 2.0), 0.5);
}

float getPhi(vec3 xyz) {
    return atan(xyz.y / xyz.x);
}

float getTheta(vec3 xyz) {
    return atan(pow(pow(xyz.x,2.0) + pow(xyz.y,2.0),0.5) / xyz.z);
}

// mandelbulb equation is: v->v^n+c, 
// 1. we iterate through this formula over a high number of iterations.
// 2. when the high number of iterations is done, if we're still in some 
// predefined bounds, we'll go and say it's part of the mandelbulb. 
// 3. if it is part of the mandelbulb we return 0.
// 4. if it's not part of the mandelbulb we're prob ok to return super
// high value to tell ray marcher don't render!
// return whether or not the point given is part of the mandelbulb
// I will use n = 8 and bound it to circle of radius 2 to start
float mandelbulb(vec3 c) {
    //https://en.wikipedia.org/wiki/Mandelbulb
    float exponent = 8.0;
    float r;
    float phi;
    float theta;
    vec3 vecCalc = vec3(0.0, 0.0, 0.0);
    for(int i = 0; i < 32; i++) {
        exponent = 8.0;
        r = getR(vecCalc);
        phi = getPhi(vecCalc);
        theta = getTheta(vecCalc);
        vecCalc = vec3(
            pow(r, exponent) * sin(exponent * theta) * cos(exponent * phi),
            pow(r, exponent) * sin(exponent * theta) * sin(exponent * phi),
            pow(r, exponent) * cos(exponent * theta)
            );
        vecCalc += c;
        if(length(vecCalc) > 2.0) {
            return 9999.99; // indicate outside by saying we're super far
        }
    }
    return 0.0;
}


// @param
// takes in a point that is within EPSILON of a surface.
// to use this function, calculate the current point by 
// taking the rayDirection and the returned value from 
// the trace() function and figuring out where along the
// ray is the point
// @return the surface normal 
vec3 getSurfaceNormal(vec3 p, int frame) {
    return normalize(vec3(
        sceneSDF(vec3(p.x+EPSILON, p.y, p.z), frame) - sceneSDF(vec3(p.x-EPSILON, p.y, p.z), frame),
        sceneSDF(vec3(p.x, p.y+EPSILON, p.z), frame) - sceneSDF(vec3(p.x, p.y-EPSILON, p.z), frame),
        sceneSDF(vec3(p.x, p.y, p.z+EPSILON), frame) - sceneSDF(vec3(p.x, p.y, p.z-EPSILON), frame)
        ));
}


vec3 getPhongColor(vec3 surfaceNormal, vec3 lightPosition, vec3 cameraPosition, vec3 vertexPosition, vec3 lightColor, vec3 ambientLight, vec3 diffuseColor, float specularity, vec3 specularColor) {
    vec3 normal = normalize(surfaceNormal);
    vec3 lightDirection = normalize(lightPosition - vertexPosition);
    vec3 cameraDirection = normalize(cameraPosition - vertexPosition);
    float nDotL = max(dot(lightDirection, normal), 0.0);
    vec3 diffuse = lightColor * diffuseColor * nDotL;
    vec3 ambient = ambientLight * diffuseColor;

    vec3 reflection = reflect(-1.0 * lightDirection, normal);
    float vERDot = max(dot(cameraDirection, reflection), 0.0);
    vec3 specular = pow(vERDot,specularity) * specularColor;

    return vec3(diffuse + ambient + specular);
}


// signed distance field function for the whole scene
float sceneSDF(vec3 p, int frame) {
    return mandelbulb(p);
}

float trace(vec3 origin, vec3 rayDirection, float cameraFrontClip, int frame) {
    float depth = cameraFrontClip;
    // 
    for(int i = 0; i < MAX_MARCHING_STEPS; i++) {
        // find out whether the current position along the ray is 'within(negative value or less than "epsilon")' the SDF function
        float sdfResult = sceneSDF(origin + rayDirection * depth, frame); 
            // this implementation of depth incrementation should ensure that this result is always positive for a sphere 
        
        // if we're inside the sphere(or close enough), return the distance or depth        
        if (sdfResult < EPSILON) {
            return depth;
        }

        // if we're still outside the sphere, increment by the distance away or depth we are in the same direction
        // increment the depth up the safest val (safest val is case of the straight line from eye to origin direction)
        //depth = depth + sdfResult; // for objects that bulge out from a point that's not the center, this might not work. 
        depth = depth + ARBITRARY_STEP_SIZE;
        // if we're past the max depth then we'll return END and we'll terminate 
        if (depth >= MAX_DISTANCE) {
            return MAX_DISTANCE;
        }
    }
    return MAX_DISTANCE;
}


// take in a point, rotate around x axis with pivot at 0,0,0
// pass in 0, 1, 2 for xyz to axis
// return rotated point
vec3 rotate(vec3 point, float degree, int axis) {
    // define multiplication matrix
    mat3 r;
    if (axis == 0) {
        r = mat3(vec3(1.0, 0, 0),vec3(0, cos(degree), sin(degree)),vec3(0, -sin(degree), cos(degree)));
    } else if(axis == 1) {
        r = mat3(vec3(cos(degree), 0, -1.0 * sin(degree)),vec3(0, 1.0, 0),vec3(sin(degree), 0, cos(degree)));
    } // TODO type up z axis rot matrix
    
    // multiply the matrix 
    return r * point;
}

//take in eye as well as a point and rotate point around the eye
// can be used for ray direction to figure out the appropriate rotation
vec3 rotate(vec3 point, vec3 eye) {
    return vec3(0,0,0);
}

//take in target, eye, point
// return point rotated so that camera will face the target
vec3 rotate(vec3 point, vec3 eye, vec3 target){
    return vec3(0,0,0);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Shift it over and scale so our coordiantes are from -1 to 1
    uv = uv * 2.0 - 1.0 ;

    // correct x scale for aspect ratio, assume x value of iResolution is greater than y. 
    uv.x = uv.x * iResolution.x / iResolution.y;
    
    // ray direction - direction from eye that we'll send out rays
    // picking -1.0 for z means we'll slightly wider than 90 degree fov since x value of aspect is wider
    vec3 rayDirection = normalize(vec3(uv, -iResolution.x / iResolution.y));

    rayDirection = rotate(rayDirection, 1.0, 0);    

    // define camera eye, assume up is straight up (0,1,0) for simplicity
    vec3 eye = vec3(0.0, -1.5, 1.0);

    // trace result will be at the max distance if the ray didn't hit anything.
    // trace result will be less than that if it did hit something. Colorize this appropriately.
        // the result will be some distance along the ray which specifies the vector in relation to the eye. 
    float traceResult = trace(eye, rayDirection, 0.0, iFrame);
    
    // determine surface normal
    vec3 surfacePoint = eye + rayDirection * traceResult;
    vec3 surfaceNormal = getSurfaceNormal(surfacePoint, iFrame);


    // Output to screen
    // if nothing is hit, output black, else output red
    if (traceResult > MAX_DISTANCE - EPSILON) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        // vec3 getPhongColor(vec3 surfaceNormal, vec3 lightPosition, vec3 cameraPosition, vec3 vertexPosition, vec3 lightColor, vec3 ambientLight, vec3 diffuseColor, float specularity, vec3 specularColor) {
        //float fog = 1.0 / (1.0 + traceResult * traceResult * 0.1);
        //vec3 color = getPhongColor(surfaceNormal, vec3(5.0,5.0,5.0), eye, surfacePoint, vec3(1.0,1.0,1.0),vec3(0.2,0.2,0.2), vec3(1.0, 0.2, 1.0), 10.0, vec3(1.0,1.0,1.0));
        fragColor = vec4(vec3((surfacePoint.z + 0.3) / 1.0), 1.0);
        //fragColor = vec4(vec3(fog), 1.0);
    }
    
}