# Seam Carving
A seam carving implementation on Meteor for anyone who wants to edit a photo quick.<br>
You can reduce width or height of an image without losing context which happens on cropping.

Actual site available [here](http://imagecarver.herokuapp.com/)

### Tutorial
* Select a valid image from your computer with the 'Choose file' button.
* Select any of the two energy functions. Each is a little different in its approach.
* Select whether to reduce height or width
* Select the number of pixels to remove from the height or width
* When the image shows up in the frame on the right, you can right click and save it.

An implementation of [this problem](http://www.cs.princeton.edu/courses/archive/spr13/cos226/assignments/seamCarving.html)
just done on Javascript with Meteor.

Sobel energy function accredited to [this place](https://github.com/miguelmota/sobel)
