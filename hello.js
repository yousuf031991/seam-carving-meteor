if (Meteor.isClient) {
    // counter starts at 0
    //Session.setDefault('counter', 0);

    //Template.hello.helpers({
    //    countAmount: function () {
    //
    //    }
    //});

    Template.hello.events({
        'change #file': function (event, template) {
            var url = window.URL.createObjectURL(event.target.files[0]);
            loadImage(url);
        },
        'click #carve-button': function (event, template) {
            var amount = $("#amount").val();
            var dim = $('input[name="dimension"]:checked').val();
            var canvas1 = document.getElementById("myCanvas");
            var ctx = canvas1.getContext("2d");
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
            var imageArr = imageData.data;
            var h = imageData.height;
            var w = imageData.width;
            var isWidth = true;
            var newImageData;
            //$("#loading").show();
            if (dim == 'height') {
                canvasSobel.height = canvasSobel.height - amount;
                imageArr = rotateImage(imageArr, h, w);
                h = [w, w = h][0];
                imageArr = seamDelOpns(imageArr, amount, h, w);
                imageArr = rotateImage(imageArr, h, w - amount);
            }
            else {
                canvasSobel.width = canvas1.width - amount;
                imageArr = seamDelOpns(imageArr, amount, h, w);
            }
            var contextSobel = canvasSobel.getContext("2d");
            var newIamgeData = new ImageData(new Uint8ClampedArray(imageArr), canvasSobel.width, canvasSobel.height);
            contextSobel.putImageData(newIamgeData, 0, 0);
            //$("#loading").hide();
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

    function seamDelOpns(imageArr, amount, h, w) {
        for (var i = 0; i < amount; i++) {
            var energyArr = calcEnergy(imageArr, h, w - i);
            var seamSol = findSeam(energyArr, h, w - i);
            imageArr = removeVertSeam(seamSol, imageArr, h, w - i);
        }
        return imageArr;
    }

    function pixelAt(row, width, col) {
        return (row * 4 * width) + (4 * col);
    }

    function calcEnergy(data, h, w) {
        var energy = [];
        var energyArr = [];
        var rowEnergy = [];
        var i, j, lastrow, nextrow, lastcol, nextcol, current, rx, gx, bx, ry, gy, by, en, delx, dely;
        for (i = 0; i < h; i++) {
            rowEnergy = [];
            for (j = 0; j < w; j++) {
                current = pixelAt(i, w, j);
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
            }
            energyArr.push(rowEnergy);
        }
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
        sol.push(solRow);
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
            sol.push(solRow);
            row++;
        }
        return findSeamSol(dp, sol, w, h);
    }

    function findSeamSol(dp, sol, w, h) {
        var seamSol = [];
        var lastPos = 0;
        var row = h - 1;
        var lastMin = dp[row][0];
        for (var i = 1; i < w; i++) {
            if (dp[row][i] < lastMin) {
                lastMin = dp[row][i];
                lastPos = i;
            }
        }
        seamSol.push(lastPos);
        while (row > 0) {
            lastPos = lastPos + sol[row][lastPos];
            seamSol.push(lastPos);
            row--;
        }
        return seamSol;
    }

    function removeVertSeam(seamSol, imageArr, h, w) {
        var newImageArr = [];
        var i;
        for (i = 0; i < h; i++) {
            seamSol[i] = pixelAt(i, w, seamSol[i]);
        }
        i = 0;
        var j = 0;
        while (i < imageArr.length) {
            if (j < h && i == seamSol[j]) {
                i += 4;
                j++;
            } else {
                newImageArr.push(imageArr[i]);
                i++;
            }
        }
        return newImageArr;
    }

    function rotateImage(imageArr, h, w) {
        var newImage = [];
        var pos;
        for (var i = 0; i < w; i++) {
            for (var j = 0; j < h; j++) {
                pos = pixelAt(j, w, i);
                newImage.push(imageArr[pos]);
                newImage.push(imageArr[1 + pos]);
                newImage.push(imageArr[2 + pos]);
                newImage.push(imageArr[3 + pos]);
            }
        }
        return newImage;
    }

    loadImage('/castle.jpg');
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}
