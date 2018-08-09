/*
This iterates over the mandelbrot equation, f(z) = z^2 + c.
The x axis is the real number plane and the y axis denotes imaginary nums.
z starts off as a complex number 0i + 0. c is the x+y(i) pos of the current pixel.
The mandelbrot function below steps through the mandelbrot equation over and over
using the previous value of f(z) as z until the value of f(z) escapes a bounds
or the max iteration count is hit. The ratio of iterations successfully 
taken to max iterations is used as the pixel's red percentage. 

The solid parts of the image are parts of the image that the returned value 
of mandelbrot(c) didn't exceed the bounds. As we got further away, the pixel fell
out of the bounds. 

The bounds in this image are a circle of radius 2 centered at the center of the 
screen.

The complex number multiplication has been tweeked to make the mandelbrot 
stretch and span in a periodic manner. 
Comment out line 24 to make it not stretch.
*/


#define MAX_ITERERATIONS 32
#define STRETCH

// return number of iterations it made it to before escaping bounds...
// c = cur position

// f(z) = z^2 + c
// where z and c are complex numbers
// c is the current position on the plane times some scalar
    // c is used as a vector to determine the jump
// z starts of 0i + 0, subsequent iterations use f(z) as z values

// when a complex number is squared, we end up with the following result:
// (ai + b)(ai + b)
// 2abi + (b^2 - a^2) + c


// this fuction uses 2 variables to keep track of the real and imaginary
// parts of the complex numbers z and c
// input c.x must be real component
// input c.y must be imaginary component of c
    // this order makes sense as x axis is real and y is imaginary


int mandelbulb(vec2 c) {
    float zReal = 0.0;
    float zImaginary = 0.0;
    
    float cReal = c.x;
    float cImaginary = c.y;
    
    float curZReal = 0.0;
    float curZImaginary = 0.0;

    vec2 testVector;
    //int curCount = 0;
    for(int i = 0; i < MAX_ITERERATIONS; i++) {
        curZReal = zReal;
        curZImaginary = zImaginary;
        zReal = pow(curZReal, 2.0) - pow(curZImaginary, 2.0) + cReal;
        #ifndef STRETCH
            zImaginary = 2.0 * curZReal * curZImaginary + cImaginary;
        #else
            zImaginary = 5.0 * sin(float(iFrame) * 0.01) * curZReal * curZImaginary + cImaginary;
        #endif
        testVector = vec2(zReal, zImaginary);
        if(length(testVector) > 2.0) { // if out of bounds return the value of i
            return i - 1;
        }
        //if(testVector.x > 2.0 || testVector.x < -2.0){
        //    return i - 1;
        //}
        
    }
    return MAX_ITERERATIONS;
}

// ------------------------------------------------
// TEST FUNCTIONS
// tutorialMandelbulb

// checkCircle()
// test function
// ensure our uv scaling map is correct
float checkCircle(vec2 xy) {
    float disFromZero = pow(pow(xy.x, 2.0) + pow(xy.y, 2.0),0.5);
    if(disFromZero < 1.0) {
        return 1.0; 
    } else {
        return 0.0;
    }
}

// ------------------------------------------------


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    
    // Set y from -1 to 1 and x to appropriate scale based on aspect
    uv = uv * 2.0 - 1.0;
    uv.x = uv.x * iResolution.x / iResolution.y;
    
    
    
    
    fragColor = vec4(0,0,0,1.0);
    
    vec2 c = uv;
    
    int result = mandelbulb(c);
    float color = float(result) / float(MAX_ITERERATIONS);
    fragColor = vec4(color, 0,0,1.0);
    
    
    // ------------------------------------------------
    // Test output
    //if(result > 30) {
    // fragColor = vec4(1.0,0,0,1.0);
    //}
    // ------------------------------------------------
    
}