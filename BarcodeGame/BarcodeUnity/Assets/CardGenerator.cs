using System.Collections;
using System.Collections.Generic;
using UnityEngine;


//Manages the three cards displayed and regenerates them when needed
public class CardGenerator : MonoBehaviour
{
    public ActionManager actionManager;

    public List<CardHandler> cards = new List<CardHandler>();

    public void GenerateCards(int tier)
    {
        //Refresh sfx
        if(SoundEffectManager.instance != null){
            SoundEffectManager.instance.PlaySoundEffect(SoundEffectManager.instance.refresh);
        }
        // SoundEffectManager.instance.PlaySoundEffect(SoundEffectManager.instance.refresh);

        //Generate three random actions
        List<ActionManager.Action> actions = actionManager.pickActions(tier, 3);

        //Update the cards with the new actions
        for (int i = 0; i < cards.Count; i++)
        {
            //Randomize the attack power between 80% and 120% of the base attack power
            actions[i].strength = (int)(actions[i].strength * Random.Range(0.9f, 1.1f));

            //Randomize the charges between 100-133% of the base charges
            actions[i].chargesLeft = (int)(actions[i].defaultCharges * Random.Range(1f, 1.33f));

            cards[i].actionForCard = actions[i];
            cards[i].UpdateCard();
        }
    }

    public ActionManager.Action GetSelectedAction()
    {
        foreach (CardHandler card in cards)
        {
            if (card.isSelected)
            {
                return card.actionForCard;
            }
        }
        return null;
    }

    //Get action from card index
    public ActionManager.Action GetAction(int index)
    {
        return cards[index].actionForCard;
    }
}
