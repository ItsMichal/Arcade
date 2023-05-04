using System.Collections;
using System.Collections.Generic;
using UnityEngine;


//Creates random barcodes which when scanned will trigger an action
//tied to a player in the game
//Stores the loookup so that when OnScanRead is called an action in the
//game will be triggered. 
public class BarcodeHandler : MonoBehaviour
{
    public static BarcodeHandler instance;

    public int[] playerIds = new int[2]{0,1};

    //Actions to choose from randomly
    public List<ActionManager.Action> actions = new List<ActionManager.Action>();

    //Dictionary that maps a barcode to an action
    private Dictionary<string, ActionManager.Action> barcodeToAction = new Dictionary<string, ActionManager.Action>();

    //Dictionary that maps a barcode to a player
    private Dictionary<string, int> barcodeToPlayer = new Dictionary<string, int>();

    public class BarcodeDetails{
        public string barcode;
        public ActionManager.Action action;
        public int targetPlayerId;
    }

    public BarcodeDetails GenerateBarcode(int targetPlayerId, ActionManager.Action action){
        //Create a random 3 letter string not already in the dictionary
        string barcode = "";
        do{
            barcode = "";
            for(int i = 0; i < 3; i++){
                barcode += (char)Random.Range(65, 91);
            }
        }while(barcodeToAction.ContainsKey(barcode));

        //Pick to choose a random action from the list
        if(action == null){
            action = actions[Random.Range(0, actions.Count)];
        }

        //Add the barcode to the dictionary
        barcodeToAction.Add(barcode, action);

        //Add the barcode to the dictionary
        barcodeToPlayer.Add(barcode, targetPlayerId);

        Debug.Log(GetPlayersBarcodesToPrint(targetPlayerId));

        //Print the barcode

        return new BarcodeDetails{
            barcode = barcode,
            action = action,
            targetPlayerId = targetPlayerId
        };
    }

    //DEPREC!
    public void PrintBarcodesForPlayer(int playerId){
        PrintManager.instance.StartCoroutine("PrintStrings", GetPlayersBarcodesToPrint(playerId));
    }

    string[] GetPlayersBarcodesToPrint(int playerId){
        List<string> barcodes = new List<string>();
        foreach(KeyValuePair<string, int> entry in barcodeToPlayer){
            if(entry.Value == playerId){
                barcodes.Add(entry.Key);
            }
        }
        return barcodes.ToArray();
    }

    public BarcodeDetails ReadBarcode(string barcode){
        if(barcodeToAction.ContainsKey(barcode)){
            return new BarcodeDetails{
                barcode = barcode,
                action = barcodeToAction[barcode],
                targetPlayerId = barcodeToPlayer[barcode]
            };
        }
        return null;
    }

     // Start is called before the first frame update
    void Start()
    {
        instance = this;
    }


}
