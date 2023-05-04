using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ActionManager : MonoBehaviour
{
    public List<Action> allActions = new List<Action>();


    [System.Serializable]
    public class Action
    {
        public string name;
        public string shortDesc;

        //How many charges the action has by default
        public int defaultCharges;

        [HideInInspector]
        public int chargesLeft;

        public ActionType type;

        public ActionElement element;

        public int tier; //What tier to start selecting this action at

        public float strength; // How much damage/healing/buff/debuff/status

        public float duration; // How long the action lasts

        //Copy constructor
        public Action(Action action)
        {
            name = action.name;
            shortDesc = action.shortDesc;
            defaultCharges = action.defaultCharges;
            chargesLeft = action.defaultCharges;
            type = action.type;
            element = action.element;
            tier = action.tier;
            strength = action.strength;
            duration = action.duration;
        }

    }

    [System.Serializable]
    public enum ActionElement
    {
        Fire,
        Water,
        Ice,
        Neutral
    }

    public static ActionElement GetWeakElement(ActionElement element)
    {
        switch (element)
        {
            case ActionElement.Fire:
                return ActionElement.Water;
            case ActionElement.Water:
                return ActionElement.Ice;
            case ActionElement.Ice:
                return ActionElement.Fire;
            case ActionElement.Neutral:
                return ActionElement.Neutral;
        }
        return ActionElement.Neutral;
    }

    public static ActionElement GetStrongElement(ActionElement element)
    {
        switch (element)
        {
            case ActionElement.Fire:
                return ActionElement.Ice;
            case ActionElement.Water:
                return ActionElement.Fire;
            case ActionElement.Ice:
                return ActionElement.Water;
            case ActionElement.Neutral:
                return ActionElement.Neutral;
        }
        return ActionElement.Neutral;
    }

    [System.Serializable]
    public enum ActionType
    {
        Attack,
        Heal,
        Shield,
    }

    //Pick a random action from the current tier or below.
    public Action pickAction(int tier)
    {
        List<Action> actions = new List<Action>();
        foreach (Action action in allActions)
        {
            if (action.tier <= tier)
            {
                actions.Add(action);
            }
        }

        return actions[Random.Range(0, actions.Count)];
    }

    //Pick n random actions from the current tier or below.
    public List<Action> pickActions(int tier, int n)
    {
        List<Action> actions = new List<Action>();
        foreach (Action action in allActions)
        {
            if (action.tier <= tier)
            {
                actions.Add(action);
            }
        }

        List<Action> pickedActions = new List<Action>();
        Debug.Log("Picking " + n + " actions from " + actions.Count + " actions");
        for (int i = 0; i < n; i++)
        {
            pickedActions.Add(actions[Random.Range(0, actions.Count)]);
        }

        return pickedActions;
    }

}

