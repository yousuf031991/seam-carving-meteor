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
            var canvasSobel = document.getElementById('yourCanvas');
            //to be changed to new h and w
            canvasSobel.height = canvas1.height;
            canvasSobel.width = canvas1.width;

            var contextSobel = canvasSobel.getContext("2d");

            var imageArr = imageData.data;
            var h = imageData.height;
            var w = imageData.width;
            var isWidth = true;
            var newImageData;
            if (dim == 'height') {
                //transpose if height reduction
                //isWidth = false;
                //energyArr = _.zip.apply(_, energyArr);
                canvasSobel.height = canvasSobel.height - amount;


                contextSobel.putImageData(imageArr, 0, 0);
            }
            else {
                canvasSobel.width = canvas1.width - amount;
                for (var i = 0; i < amount; i++) {
                    var energyArr = calcEnergy(imageArr, h, w - i);
                    var seamArr = findSeam(energyArr, h, w - 1);
                    removeSeam(seamArr, imageArr);
                }
                contextSobel.putImageData(imageArr, 0, 0);
            }
            //var energyArr = calcEnergy(imageArr, h, w);
            //var seam = findSeam(energyArr);
            //contextSobel.putImageData(energyImageData, 0, 0);
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

    function calcEnergy(data, h, w) {
        var energy = [];
        var energyArr = [];
        var rowEnergy = [];
        var i, j, lastrow, nextrow, lastcol, nextcol, current, rx, gx, bx, ry, gy, by, en, delx, dely;
        for (i = 0; i < h; i++) {
            rowEnergy = [];
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
                rowEnergy.push(en);
                //energy.push(en, en, en, 255);
            }
            energyArr.push(rowEnergy);
        }

        console.log(energyArr);
        //console.log(new ImageData(new Uint8ClampedArray(energy), w, h));
        return energyArr;
    }

    function findSeam(energyArr, h, w) {
        var dp = [];
        var dpRow = [];
        var sol = [];
        var solRow = [];
        for (var i = 0; i < w; i++) {
            dpRow.push(energyArr[0][i]);
            solRow.push(0);
        }
        dp.push(dpRow);
        var row = 1;
        var cur;
        while (row < h) {
            dpRow = [];
            solRow = [];
            if (dp[row - 1][0] + energyArr[row][0] <= dp[row - 1][1] + energyArr[row][0]) {
                dpRow.push(dp[row - 1][0] + energyArr[row][0]);
                solRow.push(0);
            } else {
                dpRow.push(dp[row - 1][1] + energyArr[row][0]);
                solRow.push(1);
            }
            for (var col = 1; col < w - 1; col++) {
                cur = energyArr[row][col];
                if (dp[row - 1][col] + cur <= dp[row - 1][col + 1] + cur && dp[row - 1][col] + cur <= dp[row - 1][col - 1] + cur) {
                    dpRow.push(dp[row - 1][col] + cur);
                    solRow.push(0);
                } else if (dp[row - 1][col + 1] + cur <= dp[row - 1][col] + cur && dp[row - 1][col + 1] + cur <= dp[row - 1][col - 1] + cur) {
                    dpRow.push(dp[row - 1][col + 1] + cur);
                    solRow.push(1);
                } else {
                    dpRow.push(dp[row - 1][col - 1] + cur);
                    solRow.push(-1);
                }
            }
            if (dp[row - 1][w - 1] + energyArr[row][w - 1] <= dp[row - 1][w - 2] + energyArr[row][w - 1]) {
                dpRow.push(dp[row - 1][w - 1] + energyArr[row][w - 1]);
                solRow.push(0);
            } else {
                dpRow.push(dp[row - 1][w - 2] + energyArr[row][w - 1]);
                solRow.push(-1);
            }
            dp.push(dpRow);
            sol.push(solRow)
            row++;
        }
        var seamSol = findSeamSol(dp, sol);
    }

    function findSeamSol(dp, sol) {
        

    }

    loadImage('/gear.png');
}


if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}
