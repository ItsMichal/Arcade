using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BattlePlayer : MonoBehaviour
{

    public static float maxHp = 1000f;

    private float currentHp = maxHp;

    public static float maxStamina = 2f;

    private float currentStamina = 1f;

    public int playerId = 0;

    public bool isDead = false;

    // public float cooldownTimeMs = 5000f;

    // private float cooldownTimer = 0f;

    private float shieldMultiplier = 1f;
    private float shieldTime = 0;


    private ActionManager.Action queuedAttack = null;

    private float queuedAttackTimer = 0f;

    private ActionManager.ActionElement shieldElement = ActionManager.ActionElement.Neutral;

    public List<ActionManager.Action> playersActions = new List<ActionManager.Action>();

    public Animator animator;

    public GameObject character;

    public void HandleAction(ActionManager.Action action)
    {
        //Check if action has charges left
        // if (action.chargesLeft <= 0)
        // {
        //     BattleSystem.instance.uiSystem.UpdateMessage(playerId, "You don't have any charges left for " + action.name + "! Lost some stamina.");
        //     if(currentStamina > 0.5f){
        //         currentStamina -= 0.5f;
        //     }
        //     return;
        // }

        //Remove action charge
        // action.chargesLeft--;

        //Set queued action
        queuedAttack = action;

        //Reset timer
        queuedAttackTimer = 0f;

        //Update UI
        BattleSystem.instance.uiSystem.UpdateMessage(playerId, "Began charging " + action.name + " (" + action.duration +  "s)!");

        
    }


    //If stamina is less than 1, add 0.2 every second
    //If stamina is greater than 1, add 0.1 every second
    void UpdateStamina()
    {
        if (currentStamina < 1f)
        {
            currentStamina += 0.2f * Time.deltaTime;
        }
        else
        {
            currentStamina += 0.1f * Time.deltaTime;
        }
        if (currentStamina > maxStamina)
        {
            currentStamina = maxStamina;
        }

    }

    //Reduces the shield time by 1 every second if above 0
    //If shield time is less than 0, set shield to neutral
    void UpdateShield()
    {
        if (shieldTime > 0f)
        {
            shieldTime -= Time.deltaTime;
        }
        else if(shieldElement != ActionManager.ActionElement.Neutral)
        {
            //update ui
            BattleSystem.instance.uiSystem.UpdateMessage(playerId, "Your shield has worn off!");
            BattleSystem.instance.uiSystem.UpdateShield(playerId, false, ActionManager.ActionElement.Neutral);
            shieldElement = ActionManager.ActionElement.Neutral;
            shieldTime = 0f;
        }
    }


    void UpdateHp()
    {
        BattleSystem.instance.uiSystem.UpdateHp(playerId, currentHp);
    }

    

    void UpdateAttackTimer(){
        //increment timer if there is a queued attack
        if(queuedAttack != null){
            queuedAttackTimer += Time.deltaTime;
            //if timer is greater than duration, execute attack
            if(queuedAttackTimer >= queuedAttack.duration){
                ExecuteAction(queuedAttack);
                queuedAttack = null;
                queuedAttackTimer = 0f;
            }
        }
    }

    void ExecuteAction(ActionManager.Action action){
        switch (action.type)
        {
            case ActionManager.ActionType.Attack:
                // BattleSystem.instance.uiSystem.UpdateMessage(playerId, "used " + action.name + " and dealt " + action.strength + " damage!");

                //Play sound effect based on attack type
                switch (action.element)
                {
                    case ActionManager.ActionElement.Fire:
                        SoundEffectManager.instance.PlaySoundEffect(SoundEffectManager.instance.fireAttack);
                        break;
                    case ActionManager.ActionElement.Water:
                        SoundEffectManager.instance.PlaySoundEffect(SoundEffectManager.instance.waterAttack);
                        break;
                    case ActionManager.ActionElement.Ice:
                        SoundEffectManager.instance.PlaySoundEffect(SoundEffectManager.instance.iceAttack);
                        break;
                    case ActionManager.ActionElement.Neutral:
                        break;
                }

                //Get other player
                BattlePlayer otherPlayer = BattleSystem.instance.GetPlayer(1 - playerId);

                //Apply damage
                //Check if other player has shield
                //If other player has shield, check if shield is
                //same element of attack or neutral = 0.75x damage
                //weak element = 1.25x damage
                //strong element = 0.5x damage
                float damage = action.strength;

                if (otherPlayer.shieldTime > 0)
                {
                    if (otherPlayer.shieldElement == ActionManager.GetWeakElement(action.element))
                    {
                        damage *= 1.25f * otherPlayer.shieldMultiplier;
                        otherPlayer.animator.SetTrigger("Hurt");
                        SoundEffectManager.instance.PlaySoundEffect(SoundEffectManager.instance.takeDamage);
                        BattleSystem.instance.uiSystem.UpdateMessage(playerId, "CRIT! Your" + action.name + " pierced the shield! Did" + damage + " damage! (" + 1.25f * otherPlayer.shieldMultiplier + "x shield)");
                        // BattleSystem.instance.uiSystem.UpdateMessage(otherPlayer.playerId, "Your shield was pierced! Took" + damage + " damage! (" + 1.25f * otherPlayer.shieldMultiplier + "x shield)");
                    }
                    else if (otherPlayer.shieldElement == ActionManager.GetStrongElement(action.element))
                    {
                        damage *= 0.5f * otherPlayer.shieldMultiplier;
                        otherPlayer.animator.SetTrigger("Block");
                        SoundEffectManager.instance.PlaySoundEffect(SoundEffectManager.instance.blockAttack);
                        BattleSystem.instance.uiSystem.UpdateMessage(playerId, "Your" + action.name + " bounced off the shield! Did" + damage + " damage! (" + 0.5f * otherPlayer.shieldMultiplier + "x shield)");
                        // BattleSystem.instance.uiSystem.UpdateMessage(otherPlayer.playerId, "Your shield parried the attack! Took" + damage + " damage! (" + 0.5f * otherPlayer.shieldMultiplier + "x shield)");
                    }
                    else
                    {
                        damage *= 0.75f * otherPlayer.shieldMultiplier;
                        otherPlayer.animator.SetTrigger("Block");
                        SoundEffectManager.instance.PlaySoundEffect(SoundEffectManager.instance.blockAttack);
                        BattleSystem.instance.uiSystem.UpdateMessage(playerId, "Your" + action.name + " hit the shield! Did" + damage + " damage! (" + 0.75f * otherPlayer.shieldMultiplier + "x shield)");
                        // BattleSystem.instance.uiSystem.UpdateMessage(otherPlayer.playerId, "Your shield blocked the attack! Took" + damage + " damage! (" + 0.75f * otherPlayer.shieldMultiplier + "x shield)");
                    }
                }else{
                    //Do normal damage if no shield
                    otherPlayer.animator.SetTrigger("Hurt");
                    SoundEffectManager.instance.PlaySoundEffect(SoundEffectManager.instance.takeDamage);
                    BattleSystem.instance.uiSystem.UpdateMessage(playerId, "used " + action.name + " and dealt " + damage + " damage!");
                    // BattleSystem.instance.uiSystem.UpdateMessage(otherPlayer.playerId, "You took " + damage + " damage!");
                }


                otherPlayer.currentHp -= damage;

                this.animator.SetTrigger("Attack1");

                //Check if other player is dead
                if (otherPlayer.currentHp <= 0)
                {
                    otherPlayer.animator.SetTrigger("Death");
                    otherPlayer.currentHp = 0;
                    otherPlayer.isDead = true;
                    BattleSystem.instance.uiSystem.UpdateMessage(otherPlayer.playerId, "You died!");
                    // BattleSystem.instance.uiSystem.UpdateMessage(playerId, "You killed " + otherPlayer.name + "!");
                }

                //Reset stamina to 0 
                currentStamina = 0f;

                break;
            case ActionManager.ActionType.Heal:
                BattleSystem.instance.uiSystem.UpdateMessage(playerId, "used " + action.name + " and healed " + action.strength + " hp!");
                currentHp += action.strength;// * currentStamina;
                currentStamina = 0f;
                break;
            case ActionManager.ActionType.Shield:
                BattleSystem.instance.uiSystem.UpdateMessage(playerId, "used " + action.name + " and gained a "+ action.type + " shield (30s)!");
                BattleSystem.instance.uiSystem.UpdateShield(playerId, true, action.element);
                shieldMultiplier = 1.0f;// * (1 / currentStamina);
                shieldElement = action.element;
                shieldTime = action.duration*2f;
                currentStamina = 0f;
                break;
            default:
                break;
        }
    }

    void Update()
    {
        UpdateAttackTimer();
        // UpdateStamina();
        UpdateShield();
        UpdateHp();

    

        if (currentHp <= 0f)
        {
            isDead = true;
        }


        if (isDead)
        {
            // BattleSystem.instance.uiSystem.UpdateMessage(playerId, "You are dead! LOSER!");
        }
        else
        {
            BattleSystem.instance.uiSystem.UpdateHp(playerId, currentHp);
            if(queuedAttack != null){
                BattleSystem.instance.uiSystem.UpdateStamina(playerId, queuedAttackTimer, queuedAttack.duration);
            }else{
                BattleSystem.instance.uiSystem.UpdateStamina(playerId, 0, 0);
            }
        }

    }

}
