using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.IO.Ports;
using System.Threading;
//https://github.com/dyadica/Unity_SerialPort/blob/master/Unity_SerialPort/Assets/Scripts/UnitySerialPort.cs

//Read the serial monitor and control the InputActions
public class ArduinoInterface : MonoBehaviour
{
    private UnitySerialPort serialPort;

    public SliderBar sliderBar;

    public float sliderMax = 950.0f;
    public float sliderMin = 182.0f;


    void Start(){
        serialPort = UnitySerialPort.Instance;

        UnitySerialPort.SerialDataParseEvent += ParseIncomingData;

        // Find the COM port containing "usbmodem" from the 
        //list of COM Ports and set it as
        //the active port

        List<string> ports = serialPort.ComPorts;
        foreach (string port in ports)
        {
            if (port.Contains("usbmodem"))
            {
                Debug.Log("Found port: " + port);
                serialPort.ComPort = port;
                break;
            }
        }

        serialPort.OpenSerialPort();

    }

    void ParseIncomingData(string[] data, string rawData){

        // Create a string for GUI display
        int[] ParsedEvtData = new int[data.Length];


        string values = string.Empty;

        // Populate both the array and string using the event data
        // Debug.Log("NEW SERIAL");

        for(int i=0; i<data.Length; i++)
        {
            // Convert the data to ints. These can be vieved
            // via the unity editor!

            int.TryParse(data[i], out ParsedEvtData[i]);
        
            data[i] = data[i].TrimEnd('\r', '\n');

            //parse the data to int
            int evtData = int.Parse(data[i]);

            //update the slider bar
            float percentage = (evtData-sliderMin)/(sliderMax-sliderMin);

            //Clamp percentage to 0-1
            percentage = Mathf.Clamp(percentage, 0.0f, 1.0f);

            sliderBar.updatePositionByPercentage(percentage);
            

            // Debug.Log("Slider Value: " + percentage);

            // add to the string
            values += i + ": " + data[i];

            // check if we are at the last value and if not add a new line
            if (i != data.Length - 1)
                values += "\n";
        }
    }

    void OnDestroy()
    {
        UnitySerialPort.SerialDataParseEvent -= ParseIncomingData;
        serialPort.CloseSerialPort();
    }
   
}
