import { Component, ViewChild } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import {
  Dimensions,
  ImageCroppedEvent,
  ImageTransform,
} from './image-cropper/interfaces/index';
import { base64ToFile } from './image-cropper/utils/blob.utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  imageChangedEvent: any = '';
  croppedImage: any = '';
  convertImage: any = '';
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  xPos = 1;
  yPos = 1;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {};
  dragOver = false;
  // zoomin zoomout
  support = '';
  coe = 0.2;
  coeStatus = '';
  scaling = false;
  trueWidth = 0;
  trueHeight = 0;
  // move img
  moveX = 0;
  moveY = 0;


  constructor(private eventManager: EventManager,private http: HttpClient) {
    this.support =
      "onwheel" in document.createElement("div")
        ? "wheel"
        : document['onmousewheel'] !== undefined
        ? "mousewheel"
        : "DOMMouseScroll";
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    // console.log(event, base64ToFile(event.base64));
  }

  imageLoaded(sourceImageDimensions: Dimensions) {
    this.showCropper = true;
    // console.log('Image loaded', sourceImageDimensions);
    this.trueWidth = sourceImageDimensions.width;
    this.trueHeight = sourceImageDimensions.height;
  }

  cropperReady(sourceImageDimensions: Dimensions) {
    // console.log('Cropper ready', sourceImageDimensions);
  }

  loadImageFailed() {
    console.log('Load failed');
  }

  rotateLeft() {
    this.canvasRotation--;
    this.flipAfterRotate();
  }

  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH,
    };
  }

  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH,
    };
  }

  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV,
    };
  }

  resetImage() {
    this.scale = 1;
    this.rotation = 0;
    this.canvasRotation = 0;
    this.transform = {};
  }

  zoomOut() {
    this.scale -= 0.1;
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }

  zoomIn() {
    this.scale += 0.1;
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }

  toggleContainWithinAspectRatio() {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }

  updateRotation() {
    this.transform = {
      ...this.transform,
      rotate: this.rotation,
    };
  }

  onDrop (e: any) {
    e.preventDefault();
    this.dragOver = false;
    let event = {
      type: "change",
      target: {
        files: e.dataTransfer.files
      }
    };
    this.fileChangeEvent(event);
  }

  onDragover (e: any) {
    e.preventDefault();
    this.dragOver = true;
  }

  onDragleave (e: any) {
    e.preventDefault();
    this.dragOver = false;
  }

  // 缩放图片
  scaleImg() {
    window['$that'] = this;
    // this.eventManager.addGlobalEventListener('window', this.support, this.changeSize)
    window.addEventListener(this.support, this.changeSize, {
      passive: false
    });
  }
  // 移出框
  cancelScale() {
    window['$that'] = undefined;
    // this.eventManager.addGlobalEventListener('window', this.support, null)
    window.removeEventListener(this.support, this.changeSize);
  }

  changeSize(e: any) {
    e.preventDefault();
    var that = window['$that']
    var change = e.deltaY || e.wheelDelta;
    var coe = that.coe;
    coe =
        coe / that.trueWidth > coe / that.trueHeight
          ? coe / that.trueHeight
          : coe / that.trueWidth;
    var num = coe * change;
    var scale = that.scale;
    num < 0
        ? (scale += Math.abs(num))
        : scale > Math.abs(num)
        ? (scale -= Math.abs(num))
        : scale;
    let status = num < 0 ? "add" : "reduce";
    if (status !== that.coeStatus) {
      that.coeStatus = status;
      that.coe = 0.2;
    }
    if (!that.scaling) {
      setTimeout(() => {
        that.scaling = false;
        that.coe = that.coe += 0.01;
        that.transform = {
          ...that.transform,
          scale: that.scale,
        };
      }, 50);
    }
    that.scaling = true;
    that.scale = scale;
  }

  uploadImg() {
    this.convertImage = this.croppedImage
    // TODO 发请求
    // this.http.post<any>('/mock/data.json', {img: this.croppedImage})
    // .subscribe((data) => {
    //   console.log(data.result)
    // });
  }

}
