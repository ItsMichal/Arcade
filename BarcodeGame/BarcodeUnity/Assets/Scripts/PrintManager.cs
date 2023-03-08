using System.Collections;
using System.Collections.Generic;
using UnityEngine.Networking;
using UnityEngine;

public class PrintManager : MonoBehaviour
{

    public static PrintManager instance;
  
   
    //Sends an http POST request to localhost:42424 with a JSON body
    //that contains the strings to be printed
    IEnumerator PrintStrings(string[] strings)
    {
        using (UnityWebRequest www = UnityWebRequest.Post("http://localhost:42424/print", ""))
        {
                //Send JSON in the body of the request
                byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(StringsToJSON(strings));
                www.uploadHandler = (UploadHandler)new UploadHandlerRaw(bodyRaw);
                www.downloadHandler = (DownloadHandler)new DownloadHandlerBuffer();
                www.SetRequestHeader("Content-Type", "application/json");
                yield return www.SendWebRequest();
                
                if (www.result != UnityWebRequest.Result.Success)
                {
                    Debug.Log(www.error);
                }
                else
                {
                    Debug.Log("Form upload complete!");
                }
        }
    }


    public string StringsToJSON(string[] strings)
    {
        //Returns a JSON string that contains the strings to be printed
        string json = "{\"strings\":[";
        for (int i = 0; i < strings.Length; i++)
        {
            if(i == strings.Length - 1){
                json += "\"*"+ strings[i] + "*\"" + "]}";
            }else{
                json += "\"*"+ strings[i] + "*\""+",";
            }
        }
        return json;
    }

    private void Awake()
    {
        instance = this;
    }
}
