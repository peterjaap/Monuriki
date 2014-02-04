/* Function needed for diffing arrays */
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/* This function is run when the screen is resized */
function onResize() {
    // browser viewport size
    var w = window.innerWidth;
    var h = window.innerHeight;

    // stage dimensions
    var ow = initialWidth;
    var oh = initialHeight;

    if (keepAspectRatio)
    {
        // keep aspect ratio
        var scale = Math.min(w / ow, h / oh);
        stage.scaleX = scale;
        stage.scaleY = scale;

        // adjust canvas size
        stage.canvas.width = ow * scale;
        stage.canvas.height = oh * scale;
    }
    else
    {
        // scale to exact fit
        stage.scaleX = w / ow;
        stage.scaleY = h / oh;

        // adjust canvas size
        stage.canvas.width = ow * stage.scaleX;
        stage.canvas.height = oh * stage.scaleY;
    }

    // update the stage
    stage.update()
}