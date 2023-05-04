using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SoundEffectManager : MonoBehaviour
{
   //Singleton
    public static SoundEffectManager instance;

    //Audio Source for playing sound effects
    public AudioSource audioSource;

    //Audio Clip for the sound effect
    public AudioClip blockAttack;

    public AudioClip waterAttack;

    public AudioClip defaultAttack;

    public AudioClip fireAttack;

    public AudioClip iceAttack;

    public AudioClip regenHealth;

    public AudioClip takeDamage;

    public AudioClip victory;

    public AudioClip refresh;

    void Start()
    {
        instance = this;
    }

    public void PlaySoundEffect(AudioClip clip)
    {
        audioSource.PlayOneShot(clip);
    }

}
