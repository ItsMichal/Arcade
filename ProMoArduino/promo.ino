#define LEFT_FOOT_PIN A1
#define RIGHT_FOOT_PIN A0
#define LEFT_STICK_PIN A3
#define RIGHT_STICK_PIN A2

#define LEFT_FOOT_OUTPUT leftFoot 
#define RIGHT_FOOT_OUTPUT rightFoot
#define LEFT_STICK_OUTPUT leftStick
#define RIGHT_STICK_OUTPUT rightStick

const long millisDelay = 50; //ms of delay before registering another of the same input type
unsigned long currentMillis = 0; //current ms in clock
unsigned long leftFootLast = 0; //current delay in left foot
unsigned long rightFootLast = 0; //current delay in right foot
unsigned long leftStickLast = 0; //current delay in left stick
unsigned long rightStickLast = 0; //current delay in right stick

bool leftFootPushed = false; //is the left foot pushed?
bool rightFootPushed = false; //is the right foot pushed?
bool leftStickPushed = false; //is the left stick pushed?
bool rightStickPushed = false; //is the right stick pushed?

void setup()
{
    //begin serial monitor
    Serial.begin(9600);

    //Set pinmodes to digital input
    pinMode(LEFT_FOOT_PIN, INPUT);
    pinMode(RIGHT_FOOT_PIN, INPUT);
    pinMode(LEFT_STICK_PIN, INPUT);
    pinMode(RIGHT_STICK_PIN, INPUT);
}

void loop()
{
    currentMillis = millis(); //update current millis

    //Check if left foot is pushed
    if(digitalRead(LEFT_FOOT_PIN) == HIGH)
    {
        //if already pushed on last tick, update last
        if(leftFootPushed)
        {
            leftFootLast = currentMillis;
        }
        else
        {
            //otherwise, send output to serial monitor
            Serial.println(LEFT_FOOT_OUTPUT);
            leftFootPushed = true;
        }
    }else{
        //If not pushed, wait until delay has passed to reset
        if(currentMillis - leftFootLast > millisDelay)
        {
            leftFootPushed = false;
        }
    }

    //Do the same for right foot
    if(digitalRead(RIGHT_FOOT_PIN) == HIGH)
    {
        if(rightFootPushed)
        {
            rightFootLast = currentMillis;
        }
        else
        {
            Serial.println(RIGHT_FOOT_OUTPUT);
            rightFootPushed = true;
        }
    }else{
        if(currentMillis - rightFootLast > millisDelay)
        {
            rightFootPushed = false;
        }
    }

    //Do the same for left stick
    if(digitalRead(LEFT_STICK_PIN) == HIGH)
    {
        if(leftStickPushed)
        {
            leftStickLast = currentMillis;
        }
        else
        {
            Serial.println(LEFT_STICK_OUTPUT);
            leftStickPushed = true;
        }
    }else{
        if(currentMillis - leftStickLast > millisDelay)
        {
            leftStickPushed = false;
        }
    }

    //Do the same for right stick
    if(digitalRead(RIGHT_STICK_PIN) == HIGH)
    {
        if(rightStickPushed)
        {
            rightStickLast = currentMillis;
        }
        else
        {
            Serial.println(RIGHT_STICK_OUTPUT);
            rightStickPushed = true;
        }
    }else{
        if(currentMillis - rightStickLast > millisDelay)
        {
            rightStickPushed = false;
        }
    }

}