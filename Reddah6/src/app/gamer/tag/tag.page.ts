import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.page.html',
  styleUrls: ['./tag.page.scss'],
})
export class TagPage implements OnInit {

  constructor() { }

  expressionVal = 0;
  upperHueVal = 200;
  upperSaturationVal = 0;
  upperLightnessVal = 90;
  lowerHueVal = 200;
  lowerSaturationVal = 0;
  lowerLightnessVal = 90;

  ngOnInit() {
  }


  getRandomNum(min, max) {
    return Math.random() * (max - min) + min;
  }

  minifigure = true;
  minifigureText = "Explode";
  explodeMinifigure() {
    this.minifigure = !this.minifigure;

    if (this.minifigure) {
        this.minifigureText = 'Explode';
    } else {
        this.minifigureText = "Rebuild";
    }
  };

  randomizeInputs() {
    var randomExpression = this.getRandomNum(0, 5);
    var randomUpperHue = this.getRandomNum(0, 360);
    var randomUpperSaturation = this.getRandomNum(0, 100);
    var randomUpperLightness = this.getRandomNum(0, 90);
    var randomLowerHue = this.getRandomNum(0, 360);
    var randomLowerSaturation = this.getRandomNum(0, 100);
    var randomLowerLightness = this.getRandomNum(0, 90);

    this.expressionVal = parseInt(randomExpression) * 100;
    this.upperHueVal = randomUpperHue;
    this.upperSaturationVal = randomUpperSaturation;
    this.upperLightnessVal = randomUpperLightness;
    this.lowerHueVal = randomLowerHue;
    this.lowerSaturationVal = randomLowerSaturation;
    this.lowerLightnessVal = randomLowerLightness;

  };



}
