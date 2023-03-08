using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BattleSystem : MonoBehaviour
{
    public static BattleSystem instance;

    public BattleUISystem uiSystem;

    public BattlePlayer player1;
    public BattlePlayer player2;

    private BattlePlayer playerToPrintNext;

    private bool bothPrinted = false;

    
    // Start is called before the first frame update
    void Start()
    {
        instance = this;

        ScannerInput.onScanRead += HandleOnScan;

        //Set the player to print to player 1
        playerToPrintNext = player1;
    }

    void HandleOnScan(string scanResult)
    {

        if(scanResult == "PRINT"){
            Debug.Log("Print button pressed");
            BarcodeHandler.BarcodeDetails details = BarcodeHandler.instance.GenerateBarcode(playerToPrintNext.playerId);
            BarcodeHandler.BarcodeDetails details2 = BarcodeHandler.instance.GenerateBarcode(playerToPrintNext.playerId);
            BarcodeHandler.instance.PrintBarcodesForPlayer(playerToPrintNext.playerId);

            //Update message to describe the action that was just printed
            uiSystem.UpdateMessage(playerToPrintNext.playerId, "You printed: " + details.action.name + "(" + details.barcode + ") and " + details2.action.name + "(" + details2.barcode + ")");

            //Switch over to the other player
            playerToPrintNext = GetPlayer(1 - playerToPrintNext.playerId);

            if(playerToPrintNext.playerId == 0){
                bothPrinted = true;
            }

            //Update the message to tell the player to print the next action
            uiSystem.UpdateWhoseTurn(playerToPrintNext.playerId);
        }

        //Interpret using BarcodeHandler
        //Get the action from the BarcodeHandler
        BarcodeHandler.BarcodeDetails barcodeDetails = BarcodeHandler.instance.ReadBarcode(scanResult);
        
        if(barcodeDetails != null){

            //Get the player from the BarcodeHandler
            BattlePlayer player = GetPlayer(barcodeDetails.targetPlayerId);

            //Handle the action
            if(bothPrinted){
                player.HandleAction(barcodeDetails.action);
            }else{
                uiSystem.UpdateMessage(player.playerId, "Wait for Player 2 first, cheater!");
            }
        }
    }

    //Check if player is dead, then reload scene to restart game
    void CheckIfGameOver(){
        if(player1.isDead || player2.isDead){
            //Reload scene
            // UnityEngine.SceneManagement.SceneManager.LoadScene(0);
        }
    }

    public BattlePlayer GetPlayer(int playerId){
        if(playerId == 0){
            return player1;
        }else{
            return player2;
        }
    }

    void Update(){
        CheckIfGameOver();
    }
}
