using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ScannerInput : MonoBehaviour
{
    public static ScannerInput instance;

    //The input field to get text input from the user


    //Create the onScanRead event that can be subscribed to
    public delegate void OnScanRead(string read);
    public static event OnScanRead onScanRead;

    private float timeSinceLastKeypress = 0f;

    private string lastRead = "";


    //Sample event that subscribes to onscanRead
    void PrintRead(string read){
        Debug.Log("Read: " + read);
    }

    void Start(){
        //Subscribe to the onScanRead event
        onScanRead += PrintRead;

        //Set the instance to this object
        instance = this;
    }

    void ReadTextScan(){
        //Using Input.inputString, build the lastRead string
        //until a newline or tab character is detected

        //If a newline or tab character is contained,, fire the onScanRead event
        //and reset the lastRead string
        if(Input.inputString.Length > 0){
            timeSinceLastKeypress = 0f;
            lastRead += Input.inputString;
            if(lastRead.Contains("\t") || lastRead.Contains("\r") || lastRead.Contains("\n")){
                //Remove any non alphanumeric characters
                lastRead = System.Text.RegularExpressions.Regex.Replace(lastRead, "[^a-zA-Z0-9]", "");

                onScanRead(lastRead);
                lastRead = "";
            }
        }

    }

    // // Update is called once per frame
    void Update()
    {
        //If input not detected for 1s, dump the lastRead variable
        timeSinceLastKeypress += Time.deltaTime * 1f;
        if (timeSinceLastKeypress > 1f)
        {
            // lastRead = "";
        }

        ReadTextScan();

    }
}
