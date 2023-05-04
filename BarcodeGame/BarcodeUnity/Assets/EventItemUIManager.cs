using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class EventItemUIManager : MonoBehaviour
{

    //Animator ref
    public Animator animator;

    //Text ref
    public TMPro.TextMeshProUGUI text;

    //Panel ref (RectTransform)
    public RectTransform panel;

    //Current pos in queue
    public int currentPosition;

    public string itemText;

    [SerializeField]
    public  int maxPos = 5;

    [SerializeField]
    public float offsetY = -80f;

    public float height = 80f;


    // Start is called before the first frame update
    void Start()
    {
        //Set text to string
        text.text = itemText;
    }

    // Update is called once per frame
    void Update()
    {
        //Check if panel is in position
        if(panel.anchoredPosition.y != (offsetY + height * currentPosition)){
            //Move panel to position
            panel.anchoredPosition = new Vector2(panel.anchoredPosition.x, Mathf.Lerp(panel.anchoredPosition.y, offsetY + height * (currentPosition), 0.1f));
        }

        //if cur pos is greater than max, delete self
        if(currentPosition > maxPos){
            Destroy(gameObject);
        }
    }
}
