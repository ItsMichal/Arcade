using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BattleUISystem : MonoBehaviour
{
    //TMP Text for Player 1 HP
    public TMPro.TextMeshProUGUI player1HpText;

    //TMP Text for Player 2 HP
    public TMPro.TextMeshProUGUI player2HpText;

    //TMP Text for Player 1 Message
    public TMPro.TextMeshProUGUI player1MessageText;

    //TMP Text for Player 2 Message
    public TMPro.TextMeshProUGUI player2MessageText;

    public TMPro.TextMeshProUGUI mainText;

    //Slider for player 1s health
    public UnityEngine.UI.Slider player1HpSlider;

    //Slider for player 2s health
    public UnityEngine.UI.Slider player2HpSlider;

    //Slider for player 1s cooldown/stamina
    public UnityEngine.UI.Slider player1CooldownSlider;
    public TMPro.TextMeshProUGUI player1CooldownText;

    //Slider for player 2s cooldown/stamina
    public UnityEngine.UI.Slider player2CooldownSlider;
    public TMPro.TextMeshProUGUI player2CooldownText;

    //Text for Cards/Tiers
    public TMPro.TextMeshProUGUI tierCardText;

    [System.Serializable]
    public class ElementShieldImages {
        public Sprite fire;
        public Sprite water;
        public Sprite ice;
        public Sprite neutral;
    }

    public ElementShieldImages playerShieldImages;

    //Image for player 1s elemental shield
    public UnityEngine.UI.Image player1ShieldImage;

    //Image for player 2s elemental shield
    public UnityEngine.UI.Image player2ShieldImage;


    public float mainTextSeconds = 5f;

    private float mainTextTimer = 0f;

    public void UpdateMainText(string text)
    {
        // mainText.text = text;
        // mainTextTimer = 0f;
        EventItemManager.instance.CreateEventItem(text);
    }
    
    public void UpdateStamina(int playerId, float curValue, float maxValue)
    {
        //Update the stamina for the player
        if (playerId == 0)
        {
            player1CooldownSlider.value = curValue;
            player1CooldownSlider.maxValue = maxValue;
            player1CooldownText.text = curValue.ToString("0") + "s" ;
        }
        else
        {
            player2CooldownSlider.value = curValue;
            player2CooldownSlider.maxValue = maxValue;
            player2CooldownText.text = curValue.ToString("0") + "s";
        }
    }

    public void UpdateShield(int playerId, bool active, ActionManager.ActionElement element)
    {
        //Update the shield for the player
        if (playerId == 0)
        {
            if (active)
            {
                switch (element)
                {
                    case ActionManager.ActionElement.Fire:
                        player1ShieldImage.sprite = playerShieldImages.fire;
                        break;
                    case ActionManager.ActionElement.Water:
                        player1ShieldImage.sprite = playerShieldImages.water;
                        break;
                    case ActionManager.ActionElement.Ice:
                        player1ShieldImage.sprite = playerShieldImages.ice;
                        break;
                }
            }
            else
            {
                player1ShieldImage.sprite = playerShieldImages.neutral;
            }
        }
        else
        {
            if (active)
            {
                switch (element)
                {
                    case ActionManager.ActionElement.Fire:
                        player2ShieldImage.sprite = playerShieldImages.fire;
                        break;
                    case ActionManager.ActionElement.Water:
                        player2ShieldImage.sprite = playerShieldImages.water;
                        break;
                    case ActionManager.ActionElement.Ice:
                        player2ShieldImage.sprite = playerShieldImages.ice;
                        break;
                }
            }
            else
            {
                player2ShieldImage.sprite = playerShieldImages.neutral;
            }
        }
    }

    public void UpdateTierText(float tierTimerLeft, float cardTimeLeft, int tier, bool maxTier =false)
    {
        string tierText = "Cards refresh in " + cardTimeLeft.ToString("0") + " seconds\n";
        if(maxTier){
            tierText += "Max Tier Reached";
        }else{
            tierText += "Tier " + (tier+1)+ " in " + tierTimerLeft.ToString("0") + " seconds\n";
            tierText += "Shuffling Tier 0 to " + tier + " cards";
        }

        tierCardText.text = tierText;
        
    }

    public void UpdateHp(int playerId, float currentHp)
    {
        //Update the HP for the player
        if (playerId == 0)
        {
            player1HpText.text = "$" + currentHp.ToString("0.00") + "k";
            player1HpSlider.value = currentHp;
        }
        else
        {
            player2HpText.text = "$" + currentHp.ToString("0.00") + "k";
            player2HpSlider.value = currentHp;
        }
    }

    public void UpdateMessage(int playerId, string message)
    {
        //Update the message for the player
        if (playerId == 0)
        {
            // player1MessageText.text = message;
            EventItemManager.instance.CreateEventItem("<sprite name=\"p1\"> "+message);
        }
        else
        {
            // player2MessageText.text = message;
            EventItemManager.instance.CreateEventItem("<sprite name=\"p2\"> "+message);
        }
    }

    public void Update()
    {
        mainTextTimer += Time.deltaTime;
        if(mainTextTimer > mainTextSeconds){
            mainText.text = "";
        }
    }

}
