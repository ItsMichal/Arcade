using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BattleUISystem : MonoBehaviour
{
    //TMP Text for Player 1 HP
    public TMPro.TextMeshProUGUI player1HpText;

    //TMP Text for Player 2 HP
    public TMPro.TextMeshProUGUI player2HpText;

    //TMP Text for Player 1 Cooldown
    public TMPro.TextMeshProUGUI player1CooldownText;

    //TMP Text for Player 2 Cooldown
    public TMPro.TextMeshProUGUI player2CooldownText;

    //TMP Text for Player 1 Message
    public TMPro.TextMeshProUGUI player1MessageText;

    //TMP Text for Player 2 Message
    public TMPro.TextMeshProUGUI player2MessageText;

    public TMPro.TextMeshProUGUI whoseTurnText;

    //Slider for player 1s health
    public UnityEngine.UI.Slider player1HpSlider;

    //Slider for player 2s health
    public UnityEngine.UI.Slider player2HpSlider;


    public void UpdateWhoseTurn(int playerId)
    {
        //Update the text to show whose turn it is
        if (playerId == 0)
        {
            whoseTurnText.text = "Player 1's Turn To Print!";
        }
        else
        {
            whoseTurnText.text = "Player 2's Turn To Print!";
        }
    }
    public void UpdateCooldown(int playerId, float cooldownTimer)
    {
        //Update the cooldown timer for the player
        if (playerId == 0)
        {
            player1CooldownText.text = cooldownTimer.ToString("0.00") + "s";
        }
        else
        {
            player2CooldownText.text = cooldownTimer.ToString("0.00") + "s";
        }
    }

    public void UpdateHp(int playerId, float currentHp)
    {
        //Update the HP for the player
        if (playerId == 0)
        {
            player1HpText.text = "HP: " + currentHp.ToString("0.00");
            player1HpSlider.value = currentHp;
        }
        else
        {
            player2HpText.text = "HP: " + currentHp.ToString("0.00");
            player2HpSlider.value = currentHp;
        }
    }

    public void UpdateMessage(int playerId, string message)
    {
        //Update the message for the player
        if (playerId == 0)
        {
            player1MessageText.text = message;
        }
        else
        {
            player2MessageText.text = message;
        }
    }

}
