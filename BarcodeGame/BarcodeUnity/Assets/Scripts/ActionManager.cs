using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ActionManager : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }

    [System.Serializable]
    public class Action
    {
        public string name;
        public string shortDesc;

        //How many charges the action has by default
        public int defaultCharges;

        private int chargesLeft;

        public ActionType type;

        public float strength; // How much damage/healing/buff/debuff/status
        public float duration; // How long the action lasts

    }

    [System.Serializable]
    public enum ActionType
    {
        Attack,
        Heal,
        Buff,
        Debuff,
        Status,
        Item
    }

}

