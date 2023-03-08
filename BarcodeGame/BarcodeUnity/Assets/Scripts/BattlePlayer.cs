using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BattlePlayer : MonoBehaviour
{
    public static float maxHp = 1000f;

    private float currentHp = 1000f;

    public int playerId = 0;

    public bool isDead = false;

    public float cooldownTimeMs = 5000f;

    private float cooldownTimer = 0f;

    public Animator animator;


    public void HandleAction(ActionManager.Action action)
    {   
        if(cooldownTimer > 0f)
        {
            BattleSystem.instance.uiSystem.UpdateMessage(playerId, "You are on cooldown!");
            return;
        }
        switch (action.type)
        {
            case ActionManager.ActionType.Attack:
                BattleSystem.instance.uiSystem.UpdateMessage(playerId, "You used " + action.name+ " and dealt " + action.strength + " damage!");
                animator.SetTrigger("Attack1");
                BattleSystem.instance.GetPlayer(1-playerId).currentHp -= action.strength;
                if(BattleSystem.instance.GetPlayer(1-playerId).currentHp < 0f){
                    BattleSystem.instance.GetPlayer(1-playerId).currentHp = 0f;
                    BattleSystem.instance.GetPlayer(1-playerId).animator.SetTrigger("Death");
                }else{
                    BattleSystem.instance.GetPlayer(1-playerId).animator.SetTrigger("Hurt");
                }
                cooldownTimer = cooldownTimeMs / 1000f;
                break;
            case ActionManager.ActionType.Heal:
                BattleSystem.instance.uiSystem.UpdateMessage(playerId, "You used " + action.name+ " and healed " + action.strength + " hp!");
                currentHp += action.strength;
                cooldownTimer = cooldownTimeMs / 1000f;
                break;
            case ActionManager.ActionType.Buff:
                break;
            case ActionManager.ActionType.Debuff:
                break;
            case ActionManager.ActionType.Status:
                break;
            case ActionManager.ActionType.Item:
                break;
            default:
                break;
        }
    }

    void UpdateCooldown(){
        if (cooldownTimer > 0f)
        {
            cooldownTimer -= Time.deltaTime;
        }
        
        BattleSystem.instance.uiSystem.UpdateCooldown(playerId, cooldownTimer);

    }

    void UpdateHp(){
        BattleSystem.instance.uiSystem.UpdateHp(playerId, currentHp);
    }    

    void Update(){

        UpdateCooldown();
        UpdateHp();

        if (currentHp <= 0f)
        {
            isDead = true;
        }


        if (isDead)
        {
            BattleSystem.instance.uiSystem.UpdateMessage(playerId, "You are dead! LOSER!");
        }
        else
        {
            BattleSystem.instance.uiSystem.UpdateHp(playerId, currentHp);
        }

    }

}
