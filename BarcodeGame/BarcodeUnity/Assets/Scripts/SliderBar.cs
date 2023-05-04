using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SliderBar : MonoBehaviour
{

    public float minX;

    public float borderOneX;
    public float borderTwoX;
    public float maxX;

    public GameObject cursor;

    public float curX;

    public CardHandler leftCard;
    public CardHandler middleCard;
    public CardHandler rightCard;

    // Start is called before the first frame update
    void Start()
    {
        ScannerInput.onScanRead += HandleOnScan;
        curX = minX;
        cursor.transform.position = new Vector3(curX, cursor.transform.position.y, cursor.transform.position.z);
    }

    // Update is called once per frame
    void Update()
    {
        //Update cur x using left and right arrows
        if(Input.GetKey(KeyCode.LeftArrow)){
            curX -= 3f * Time.deltaTime;
            if(curX < minX){
                curX = minX;
            }
            cursor.transform.position = new Vector3(curX, cursor.transform.position.y, cursor.transform.position.z);
        }else if(Input.GetKey(KeyCode.RightArrow)){
            curX += 3f * Time.deltaTime;
            if(curX > maxX){
                curX = maxX;
            }
            cursor.transform.position = new Vector3(curX, cursor.transform.position.y, cursor.transform.position.z);
        }

        //Set the active card based on the current third
        if(getCurrentThird() == 0){
            leftCard.UpdateSelected(true);
            middleCard.UpdateSelected(false);
            rightCard.UpdateSelected(false);
        }else if(getCurrentThird() == 1){
            leftCard.UpdateSelected(false);
            middleCard.UpdateSelected(true);
            rightCard.UpdateSelected(false);
        }else{
            leftCard.UpdateSelected(false);
            middleCard.UpdateSelected(false);
            rightCard.UpdateSelected(true);
        }

        
    }

    void HandleOnScan(string scanResult){
        if(scanResult == "LEFT"){
            curX = minX;
        }else if(scanResult == "CENT"){
            curX = (borderOneX + borderTwoX) / 2f;
        }else if(scanResult == "RIGH"){
            curX = maxX;
        }
    }

    public void updatePositionByPercentage(float percentage){
        curX = minX + (maxX - minX) * percentage;
        cursor.transform.position = new Vector3(curX, cursor.transform.position.y, cursor.transform.position.z);
    }

    public int getCurrentThird(){
        if(curX < borderOneX){
            return 0;
        }else if(curX < borderTwoX){
            return 1;
        }else{
            return 2;
        }
    }
}
