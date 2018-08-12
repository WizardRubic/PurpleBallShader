/*
Mandelbulb
modification to the ray march program to ray march a mandelbulb fractal

TODO
add a mandelbulb function. probably put the values of r, theta, and phi into different functions

*/


#define MAX_MARCHING_STEPS 1000
#define EPSILON 0.0001
#define MAX_DISTANCE 100.0000000 
#define ARBITRARY_STEP_SIZE 0.02

float sceneSDF(vec3 p, int frame);

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

float sphere1SDF(vec3 p) {
    p.x = p.x - 1.0;
    return length(p) - 2.0;
}

float sphere2SDF(vec3 p) {
    p.x = p.x + 1.0;
    return length(p) - 2.0;
}

float sphereSDF(vec3 p, vec3 coords, float size) {
    p.x = p.x - coords.x;
    p.y = p.y - coords.y;
    p.z = p.z - coords.z;
    return length(p) - size;
}

// array of spheres function

float sphereArraySDF(vec3 p) {
    // iterate through all the sphere positions and figure out which is the closest
    // sphere positions are from with spacing centers out by 4
    vec2 coords;
    float currentMinimum = MAX_DISTANCE;
    float testValue = 0.0;
    for(int i = 0; i < 5; i++) {
        for(int j = 0; j < 5; j++) {
            coords = vec2(i, j);
            testValue = sphereSDF(p, vec3(coords, 0.0), 0.5);
            if(testValue < currentMinimum) {
                currentMinimum = testValue;
            }
                
        }
    }
    return currentMinimum;
}

// matrix grid using fract function
// source https://www.youtube.com/watch?v=yxNnRSefK94&t=332s
float tutorialMatrix(vec3 p) {
    vec3 q = fract(p) * 2.0 - 1.0;
    return length(q) - 0.25;
}


vec3 modShiftXYZ(vec3 p, float negativeCorrection, float spacingBetweenIteration) {
    p.x = mod(p.x + negativeCorrection, spacingBetweenIteration) - negativeCorrection;
    p.y = mod(p.y + negativeCorrection, spacingBetweenIteration) - negativeCorrection;
    p.z = mod(p.z + negativeCorrection, spacingBetweenIteration) - negativeCorrection;
    return p;
}

vec3 modShiftXY(vec3 p, float negativeCorrection, float spacingBetweenIteration) {
    p.x = mod(p.x + negativeCorrection, spacingBetweenIteration) - negativeCorrection;
    p.y = mod(p.y + negativeCorrection, spacingBetweenIteration) - negativeCorrection;
    return p;
}

vec3 modShiftZ(vec3 p, float negativeCorrection, float spacingBetweenIteration) {
    p.z = mod(p.z + negativeCorrection, spacingBetweenIteration) - negativeCorrection;
    return p;
}



float gridSDF(vec3 p, int frame) {
    // take the floor of the point to create a grid snapping effect and use this as the coordinate
    
    // if (p.z > 2.7) {
    //     return MAX_DISTANCE;
    // }

    if ((p.x < 0.51) && (p.x > -0.51) &&(p.y > -0.51) &&(p.y < 0.51)) {
        return MAX_DISTANCE;
    }

    float offset = 0.0;
    // if (p.x < -0.51) {
    //     // offset = 1.5;
    // }
    p = modShiftXY(p, 0.5, 1.5 + sin(float(frame) * 0.1) * 0.3);
    p = modShiftZ(p, 1.0, 1.5);
    // p = modShiftXYZ(p, 1.0, 1.5);
    

    // vec3 gridCoordinate = floor(p);
    // gridCoordinate.z = ceil(p.z);
    
    return sphereSDF(p, vec3(0.0,0,0), 0.5);
    // float dist1 = ()
}


// signed distance field function for the whole scene
float sceneSDF(vec3 p, int frame) {
    // return sphereArraySDF(p);
    // return tutorialMatrix(p);
    return gridSDF(p, frame);
    // return min(sphere1SDF(p), sphere2SDF(p));
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

struct configObject {
    int test;
};

vec4 obtainMainPurpleBallColor(vec3 rayDirection) {
    float timeOffset = mod(float(iFrame) * 0.05, 1.5); // mod of 1.5 since the spheres repeat every 1.5 units
    vec4 fragColor;
    
    // define camera eye, assume up is straight up (0,1,0) for simplicity
    vec3 eye = vec3(0.0, 0.0, 10.0 + timeOffset);

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
        vec3 color = getPhongColor(surfaceNormal, vec3(5.0,5.0,5.0 + timeOffset), eye, surfacePoint, vec3(1.0,1.0,1.0),vec3(0.2,0.2,0.2), vec3(1.0, 0.2, 1.0), 10.0, vec3(1.0,1.0,1.0));
        fragColor = vec4(color, 1.0);
        //fragColor = vec4(vec3(fog), 1.0);
    }
    return fragColor;
}


vec4 obtainPurpleDelayedHalo(vec3 rayDirection) {
    int delay = 30;

    float timeOffset = mod(float(iFrame - delay) * 0.05, 1.5); // mod of 1.5 since the spheres repeat every 1.5 units
    vec4 fragColor;
    
    // define camera eye, assume up is straight up (0,1,0) for simplicity
    vec3 eye = vec3(0.0, 0.0, 10.0 + timeOffset); // controls z movement

    // trace result will be at the max distance if the ray didn't hit anything.
    // trace result will be less than that if it did hit something. Colorize this appropriately.
        // the result will be some distance along the ray which specifies the vector in relation to the eye. 
    float traceResult = trace(eye, rayDirection, 0.0, iFrame - delay);
    
    // determine surface normal
    vec3 surfacePoint = eye + rayDirection * traceResult;
    vec3 surfaceNormal = getSurfaceNormal(surfacePoint, iFrame - delay);


    // Output to screen
    // if nothing is hit, output black, else output red
    if (traceResult > MAX_DISTANCE - EPSILON) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        // vec3 getPhongColor(vec3 surfaceNormal, vec3 lightPosition, vec3 cameraPosition, vec3 vertexPosition, vec3 lightColor, vec3 ambientLight, vec3 diffuseColor, float specularity, vec3 specularColor) {
        //float fog = 1.0 / (1.0 + traceResult * traceResult * 0.1);
        vec3 color = getPhongColor(surfaceNormal, vec3(5.0,5.0,5.0 + timeOffset), eye, surfacePoint, vec3(1.0,1.0,1.0),vec3(0.2,0.2,0.2), vec3(1.0, 0.2, 1.0), 10.0, vec3(1.0,1.0,1.0));
        fragColor = vec4(color, 1.0);
        //fragColor = vec4(vec3(fog), 1.0);
    }
    return fragColor;
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
    

    fragColor = obtainMainPurpleBallColor(rayDirection) * 0.9 + obtainPurpleDelayedHalo(rayDirection) * 0.1;
    
    
}