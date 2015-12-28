if (Meteor.isClient) {
  // counter starts at 0
  //Session.setDefault('counter', 0);

  Template.hello.helpers({
    countAmount: function () {

    }
  });

  Template.hello.events({
    'change #file': function (event, template) {
      var canvas1 = document.getElementById("myCanvas");
      var canvasSobel = document.getElementById('yourCanvas');
      var contextSobel = canvasSobel.getContext("2d");
      var url = window.URL.createObjectURL(event.target.files[0]);
      var image = new Image();
      image.src = url;
      image.onload = function () {
        var w = image.width;
        var h = image.height;
        canvas1.width = w;
        canvas1.height = h;
        var horw = $('input[name="dimension"]:checked').val();
        //var heightOrWidth = template.find("dimension").value;
        console.log(horw);
        var amountElement = template.find("#amount");
        canvasSobel.width = w;
        canvasSobel.height = h;
        var ctx = canvas1.getContext("2d");
        ctx.drawImage(image, 0, 0);
        var imageData = ctx.getImageData(0, 0, w, h);
        var sobelImageData = Sobel(imageData);
        contextSobel.putImageData(sobelImageData, 0, 0);
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
