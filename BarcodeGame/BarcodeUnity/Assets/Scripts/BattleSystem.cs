using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BattleSystem : MonoBehaviour
{
    public static BattleSystem instance;

    public CardGenerator cardGenerator;

    public BattleUISystem uiSystem;

    public BattlePlayer player1;
    public BattlePlayer player2;

    private bool player2Ready = false;

    private bool player1Ready = false;

    private bool gameStarted = false;

    private int tier = 0;


    [SerializeField]
    private static float tierTimeLimit = 25f;
    private float tierTimer = 0f;

    [SerializeField]
    private static float cardTimeLimit = 10f;
    private float cardTimer = 0f;

    private static int maxTier = 5;

    
    // Start is called before the first frame update
    void Start()
    {
        instance = this;

        cardGenerator.GenerateCards(tier);

        ScannerInput.onScanRead += HandleOnScan;

        // HandleOnScan("P1READY");
        // HandleOnScan("P2READY");
        // HandleOnScan("P1SVMLEF");

    }

    void UpdateCardTimer(){
        cardTimer += Time.deltaTime;
        if(cardTimer >= cardTimeLimit){
            uiSystem.UpdateMainText("Cards refreshed!");
            cardGenerator.GenerateCards(tier);
            cardTimer = 0f;
        }
    }

    void UpdateTierTimer(){
        tierTimer += Time.deltaTime;
        if(tierTimer >= tierTimeLimit){
            tierTimer = 0f;
            tier++;
            uiSystem.UpdateMainText("Tier " + tier + " cards arrive!");
            if(tier >= maxTier){
                tier = maxTier;
            }
        }
    }

    void HandleOnScan(string scanResult)
    {
        if(scanResult == "P1READY"){
            player1Ready = true;
            
            player1.character.SetActive(true);

            
            uiSystem.UpdateMessage(0, "Player 1 is ready!");
        }else

        if(scanResult == "P2READY"){
            player2Ready = true;

            player2.character.SetActive(true);
            uiSystem.UpdateMessage(1, "Player 2 is ready!");
        }else

        //If scan result contains "SVM" (summon)
        //ex: "P1SVMLEF" or "P2SVMRIG"
        if(scanResult.Contains("SVM")){

            //Get the player
            BattlePlayer player = GetPlayer(scanResult.Contains("P1") ? 0 : 1);

            //Get the selection based on if LEF, CEN, or RIG
            int selection = scanResult.Contains("LEF") ? 0 : scanResult.Contains("CEN") ? 1 : 2;

            //Get the action from the selection
            ActionManager.Action action = new ActionManager.Action(cardGenerator.GetAction(selection));
            


            Debug.Log("Print button pressed");
            BarcodeHandler.BarcodeDetails details = BarcodeHandler.instance.GenerateBarcode(player.playerId, action);
            PrintManager.instance.StartCoroutine("PrintBarcode", details);
            // BarcodeHandler.instance.PrintBarcodesForPlayer(player.playerId);
            uiSystem.UpdateMainText("<sprite name=\"p"+ (player.playerId+1) + "\"> summoned " + action.name + "!");


            //Regenerate the cards
            cardGenerator.GenerateCards(tier);
            cardTimer = 0f;
        }else if (scanResult == "RESET"){
            UnityEngine.SceneManagement.SceneManager.LoadScene(0);
        }else{
            //Interpret using BarcodeHandler
            //Get the action from the BarcodeHandler
            BarcodeHandler.BarcodeDetails barcodeDetails = BarcodeHandler.instance.ReadBarcode(scanResult);
            
            if(barcodeDetails != null && gameStarted){

                //Get the player from the BarcodeHandler
                BattlePlayer player = GetPlayer(barcodeDetails.targetPlayerId);

                //Handle the action
                player.HandleAction(barcodeDetails.action);
            }
        }

        
    }

    //Check if player is dead, then reload scene to restart game
    void GameOver(){
            //Call coroutine and show message of who won
            if(player1.isDead){
                uiSystem.UpdateMessage(0, "You lost!");
                uiSystem.UpdateMessage(1, "You won!");
            }else{
                uiSystem.UpdateMessage(0, "You won!");
                uiSystem.UpdateMessage(1, "You lost!");
            }
            uiSystem.UpdateMainText("Game over! Restarting in 15s...");
            StartCoroutine(ReloadGame());
    }

    //Coroutine that reloads the game to restart it
    IEnumerator ReloadGame(){
        yield return new WaitForSeconds(15f);
        UnityEngine.SceneManagement.SceneManager.LoadScene(0);
    }

    public BattlePlayer GetPlayer(int playerId){
        if(playerId == 0){
            return player1;
        }else{
            return player2;
        }
    }

    // Coroutine that increases the stamina 

    void Update(){
        if(player1Ready && player2Ready && !gameStarted){
            gameStarted = true;
            uiSystem.UpdateMainText("Game started!");
        }

        uiSystem.UpdateTierText(tierTimeLimit - tierTimer, cardTimeLimit - cardTimer, tier, tier == maxTier);

        if(gameStarted){
            UpdateCardTimer();
            UpdateTierTimer();
        }
    }
}
