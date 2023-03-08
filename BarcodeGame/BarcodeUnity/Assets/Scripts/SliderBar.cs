using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SliderBar : MonoBehaviour
{

    public float minY;
    public float maxY;

    public GameObject cursor;

    private float curY;

    // Start is called before the first frame update
    void Start()
    {
        curY = minY;
        cursor.transform.position = new Vector3(cursor.transform.position.x, curY, cursor.transform.position.z);
    }

    // Update is called once per frame
    // void Update()
    // {
        
    // }

    public void updatePositionByPercentage(float percentage){
        curY = (maxY - minY) * percentage + minY;
        cursor.transform.position = new Vector3(cursor.transform.position.x, curY, cursor.transform.position.z);
    }
}
