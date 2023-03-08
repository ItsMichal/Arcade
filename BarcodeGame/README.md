# Barcode Game

A game that uses a printer, barcode scanners, and a foot pedal to pit two players against each other in trial by combat. Game is WIP, but integration of Arduino, Barcode Scanners, and a Print service are all done. Dynamically generates and prints barcodes which when scanned causes players to attack/heal.

# Project Structure

## `/BarcodePrintService`

A simple nodejs/express server that dynamically creates a PDF of barcodes based off of an array of strings it receives. Then calls the printer attached to the server machine (in this case, all was run locally on one laptop) to print out the generated PDF. Intended for use on paper with 4.25" width. Supports 17 barcodes/strings for a 4.25x11" paper (a standard U.S. letter cut in half).

## `/BarcodeUnity`

The basic Unity fighter game which calls the PrintService above. It facilitates the core game loop of having two players scan barcodes to attack and print out new barcodes on their "spellsheet". Integrates with an Arduino footpedal, which was originally meant to select which attack would print-- currently not implemented. 

Currently supports only attacks and heals, but plans to support a rock-paper-scissors style buff/debuff system as well as replacing the "hard cooldown" with one that scales the effect of the action instead of blocking it.

Can be opened and edited as a Unity project, my scripts are in `BarcodeUnity/Assets/Scripts` for your viewing pleasure (also includes a modified [`UnitySerialPort.cs` from @dyadica](https://github.com/dyadica/Unity_SerialPort))