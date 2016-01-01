if (Meteor.isClient) {
    // counter starts at 0
    //Session.setDefault('counter', 0);

    Template.hello.helpers({
        countAmount: function () {

        }
    });

    Template.hello.events({
        'change #file': function (event, template) {
            var url = window.URL.createObjectURL(event.target.files[0]);
            loadImage(url);

            //var canvas1 = document.getElementById("myCanvas");
            //var canvasSobel = document.getElementById('yourCanvas');
            //var contextSobel = canvasSobel.getContext("2d");
            //
            //var image = new Image();
            //image.src = url;
            //image.onload = function () {
            //    var w = image.width;
            //    var h = image.height;
            //    canvas1.width = w;
            //    canvas1.height = h;
            //    var horw = $('input[name="dimension"]:checked').val();
            //    //var heightOrWidth = template.find("dimension").value;
            //    console.log(horw);
            //    //var amountElement = template.find("#amount");
            //    //canvasSobel.width = w;
            //    //canvasSobel.height = h;
            //    ctx.drawImage(image, 0, 0);
            //    //var imageData = ctx.getImageData(0, 0, w, h);
            //    //var sobelImageData = Sobel(imageData);
            //    //contextSobel.putImageData(sobelImageData, 0, 0);
            //    var amountElement = template.find("#amount");
            //    canvasSobel.width = w;
            //    canvasSobel.height = h;
            //    var ctx = canvas1.getContext("2d");
            //    ctx.drawImage(image, 0, 0);
            //    var imageData = ctx.getImageData(0, 0, w, h);
            //    //var sobelImageData = Sobel(imageData);
            //    //contextSobel.putImageData(sobelImageData, 0, 0);
            //}
        },
        'click #carve-button': function (event, template) {
            var amount = $("#amount").val();
            var dim = $('input[name="dimension"]:checked').val();
            var canvas1 = document.getElementById("myCanvas");
            var ctx = canvas1.getContext("2d");
            //console.log(canvas1.height);
            //if (ctx == undefined) {
            //    $("#errorMessageImage").show();
            //    return false;
            //}
            //var imageData = ctx.getImageData(0, 0, ctx.width, ctx.height);
            //$("#errorMessageImage").hide();
            if (dim == undefined) {
                $("#errorMessageDim").show();
                return false;
            }
            $("#errorMessageDim").hide();
            if (amount == "") {
                $("#errorMessageAmount").show();
                return false;
            }
            $("#errorMessageAmount").hide();
            var imageData = ctx.getImageData(0, 0, canvas1.width, canvas1.height);
            console.log(imageData);
            var canvasSobel = document.getElementById('yourCanvas');
            var contextSobel = canvasSobel.getContext("2d");
            var energyImageData = calcEnergy(imageData);
            contextSobel.putImageData(energyImageData, 0, 0);
        }
    });

    function loadImage(src) {
        var image = new Image();
        image.src = src;
        image.onload = function () {
            var w = image.width;
            var h = image.height;
            var canvas1 = document.getElementById("myCanvas");
            canvas1.width = w;
            canvas1.height = h;
            var ctx = canvas1.getContext("2d");
            ctx.drawImage(image, 0, 0);
        }
    }

    function calcEnergy(imageData) {
        var energy = [];
        var h = imageData.height;
        var w = imageData.width;
        var data = imageData.data;
        var count = 0;
        var i, j, lastrow, nextrow, lastcol, nextcol, current, rx, gx, bx, ry, gy, by, en, delx, dely;
        for (i = 0; i < h; i++) {
            for (j = 0; j < w; j++) {
                current = (i * 4 * w) + (4 * j);
                if (i == 0) {
                    lastrow = ((h - 1) * 4 * (w - 1)) + (4 * j);
                } else {
                    lastrow = current - (4 * w);
                }
                if (i == h - 1) {
                    nextrow = 4 * w;
                } else {
                    nextrow = current + (4 * w);
                }
                if (j == 0) {
                    lastcol = current + 4 * (w - 1);
                } else {
                    lastcol = current - 4;
                }
                if (j == w - 1) {
                    nextcol = current - (4 * j);
                } else {
                    nextcol = current + 4;
                }
                rx = (data[lastrow] - data[nextrow]) * (data[lastrow] - data[nextrow]);
                gx = (data[lastrow + 1] - data[nextrow + 1]) * (data[lastrow + 1] - data[nextrow + 1]);
                bx = (data[lastrow + 2] - data[nextrow + 2]) * (data[lastrow + 2] - data[nextrow + 2]);
                ry = (data[lastcol] - data[nextcol]) * (data[lastcol] - data[nextcol]);
                gy = (data[lastcol + 1] - data[nextcol + 1]) * (data[lastcol + 1] - data[nextcol + 1]);
                by = (data[lastcol + 2] - data[nextcol + 2]) * (data[lastcol + 2] - data[nextcol + 2]);
                delx = rx + gx + bx;
                dely = ry + gy + by;
                en = delx + dely;
                count = count + 1;
                energy.push(en, en, en, 255);
            }
        }

        console.log(count);
        console.log(energy);
        return new ImageData(new Uint8ClampedArray(energy), w, h);
    }

    loadImage('/pic_the_scream.jpg');
}


if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}
