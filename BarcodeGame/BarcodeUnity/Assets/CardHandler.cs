using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CardHandler : MonoBehaviour
{
    //The image element of the card
    [SerializeField]
    public UnityEngine.UI.Image cardImage;

    [SerializeField]
    public ActionManager.Action actionForCard;

    //Name of the action (text field)
    [SerializeField]
    public TMPro.TextMeshProUGUI actionName;

    //Description of the action (text field)
    public TMPro.TextMeshProUGUI actionDesc;

    //How many charges the action has left (text field)
    public TMPro.TextMeshProUGUI actionCharges;

    [System.Serializable]
    public class CardImages
    {
        public Sprite fire;
        public Sprite water;
        public Sprite ice;
        public Sprite neutral;
        public Sprite heal;
        public Sprite shield;
    }

    [System.Serializable]
    public class CardBGColors {
        public Color fire;
        public Color water;
        public Color ice;
        public Color neutral;
        public Color heal;
    }

    public CardBGColors cardBGColors;

    public CardImages cardImages;

    //The action's element (image)
    public UnityEngine.UI.Image actionElement;

    //The actions damage/healing/buff/debuff/status (text field)
    public TMPro.TextMeshProUGUI actionStrength;

    public bool isSelected = false;

    //Update the card's information
    public void UpdateCard()
    {
        actionName.text = actionForCard.name;
        actionDesc.text = actionForCard.shortDesc;
        actionCharges.text = "x"+actionForCard.chargesLeft.ToString();

        switch (actionForCard.element)
        {
            case ActionManager.ActionElement.Fire:
                actionElement.sprite = cardImages.fire;
                cardImage.color = cardBGColors.fire;
                break;
            case ActionManager.ActionElement.Water:
                actionElement.sprite = cardImages.water;
                cardImage.color = cardBGColors.water;
                break;
            case ActionManager.ActionElement.Ice:
                actionElement.sprite = cardImages.ice;
                cardImage.color = cardBGColors.ice;
                break;
            case ActionManager.ActionElement.Neutral:
                actionElement.sprite = cardImages.neutral;
                cardImage.color = cardBGColors.neutral;
                break;
        }
        actionStrength.text = actionForCard.strength.ToString();

        switch (actionForCard.type)
        {
            case ActionManager.ActionType.Heal:
                actionElement.sprite = cardImages.heal;
                cardImage.color = cardBGColors.heal;
                break;
            case ActionManager.ActionType.Shield:
                actionElement.sprite = cardImages.shield;
                actionStrength.text = "Shield";

                break;
        }
    
    }

    //If selected, set alpha to 1, if not selected, set alpha to 0.5,
    //without changing the underlying color
    public void UpdateSelected(bool selected = false){
        isSelected = selected;
        if(isSelected){
            cardImage.color = new Color(cardImage.color.r, cardImage.color.g, cardImage.color.b, 1f);
        } else {
            cardImage.color = new Color(cardImage.color.r, cardImage.color.g, cardImage.color.b, 0.5f);
        }
    }

    // Start is called before the first frame update
    void Start()
    {
        UpdateCard();
        UpdateSelected();
    }


}
