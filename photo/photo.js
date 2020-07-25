photo ={
    page: 1,
    offset: 20,
    init: function () {
        var that = this;
        $.getJSON("/Images/output.json", function (data) {
            that.render(that.page, data);
            //that.scroll(data);
        });
    },

    render: function (page, data) {
        var begin = (page - 1) * this.offset;
        var end = page * this.offset;
        if (begin >= data.length) return;
        var html, imgNameWithPattern,imgName,iamgeSize,imageX,imageY, li = "";
        for (var i = begin; i < end && i < data.length; i++) {
            imgNameWithPattern = data[i].split(' ')[1];
            imgName = imgNameWithPattern.split('.')[0]
            iamgeSize = data[i].split(' ')[0];
            imageX = iamgeSize.split('.')[0];
            imageY = iamgeSize.split('.')[1];
            li += '<div class="card" style="width:260px">' +
                    '<div class="ImageInCard" style="height:'+ 260*imageY/imageX + 'px">' + 
                      '<a data-fancybox="gallery" href="/Images/' + imgNameWithPattern + '" data-caption="' + imgName + '">' +
                        '<img src="/Images/' + imgNameWithPattern + '">' +
                      '</a>' +
                    '</div>' +
                    '<div class="TextInCard">'+imgName.substr(0,7)+'</div>' +
                  '</div>' 
        }

        $(".ImageGrid").append(li);
        // $(".ImageGrid").lazyload();
        this.minigrid();
    },

    minigrid: function() {
        var grid = new Minigrid({
            container: '.ImageGrid',
            item: '.card',
            gutter: 20
        });
        grid.mount();
        $(window).resize(function() {
           grid.mount();
        });
    }

}

photo.init();
