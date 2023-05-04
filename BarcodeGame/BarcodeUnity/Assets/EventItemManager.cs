using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EventItemManager : MonoBehaviour
{
    //Event Item prefab
    public GameObject eventItemPrefab;

    //Instance
    public static EventItemManager instance;

    void Awake(){
        instance = this;
    }

    public void CreateEventItem(string text){
        //Update position of all event items to be +1
        foreach(Transform child in transform){
            child.GetComponent<EventItemUIManager>().currentPosition++;
        }
        //Spawn event item prefab as child of this object
        GameObject eventItem = Instantiate(eventItemPrefab, transform);
        //Set text
        eventItem.GetComponent<EventItemUIManager>().itemText = text;

        
    }
}
