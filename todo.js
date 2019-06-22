var itemID = 0;
var activeCount = 0;
var CL_COMPLETED = 'completed';
var CL_SELECTED = 'selected';
var CL_EDITING = 'editing';

var $ = function (sel) {
    return document.querySelector(sel);
};

var $All = function (sel) {
    return document.querySelectorAll(sel);
}

window.onload = function () {
    initSpeechRecognition();
    model.init(function () {
       var data = model.data;

       var newTodo = $('.new-todo');//获取输入框
       var addTodoButton = $('#add-todo-button');//获取添加按钮
       var clearCompleted = $('.clear-completed');//获取删除已完成按钮
       var toggleAll = $('.toggle-all');//获取前方勾选框
       var settingsButton= $('.settings-button');//获取设置按钮
       var mask = $('.mask');
       var nav = $('.nav');
       var settingsDefault = $('#settings-default');//获取默认背景按钮
       var settingsRed = $('#settings-red');
       var settingsYellow = $('#settings-yellow');
       var settingsBlue = $('#settings-blue');
       var settingsGreen = $('#settings-green');

       //为按钮添加监听事件
       addTodoButton.addEventListener('click',function (ev1) {
           console.log('click add button!');
           data.msg = newTodo.value;

           if(data.msg == ''){
              console.warn('Input is empty!');
              return;
           }

           data.items.push({msg: data.msg, completed: false});
           data.msg = '';
           model.flush();
           update();

       }, false);

       //为输入框添加监听事件
       newTodo.addEventListener('keyup', function (ev1) {
            if (ev1.keyCode != 13){
                console.log('still editing..');
                return;
            }
            console.log('finish input');
            data.msg = newTodo.value;

            if(data.msg == ''){
                console.warn('Input is empty!');
                return;
            }

            data.items.push({msg: data.msg, completed: false});
            data.msg = '';
            update();
       }, false);

       newTodo.addEventListener('change', function () { model.flush(); });

       //为删除已完成添加监听事件
       clearCompleted.addEventListener('click', function () {
       	   console.log('clear all');	
           for(var i = data.items.length - 1; i >= 0; i --){
               if(data.items[i].completed) data.items.splice(i, 1);
           }
           update();
       }, false);
        clearCompleted.addEventListener('touchstart', function () {
            console.log('clear all');
            for(var i = data.items.length - 1; i >= 0; i --){
                if(data.items[i].completed) data.items.splice(i, 1);
            }
            update();
        }, false);

       //更改事件完成情况
       toggleAll.addEventListener('change', function (ev) {
           var completed = toggleAll.checked;
           data.items.forEach(function (itemData) {
              itemData.completed = completed;
           });
           update();
       }, false);

       //为设置按钮添加监听事件
       settingsButton.addEventListener('click', function () {
           mask.style.display = 'block';
           nav.style.left = 0;
       }, false);

       //mask添加监听事件
       mask.addEventListener('click', function () {
           mask.style.display = 'none';
           nav.style.left = '-7rem';
       }, false);

       settingsDefault.addEventListener('click', function (ev) {
           var body = $('body');
           body.style.backgroundImage = "url('img/default.jpeg')";
       }, false);

       settingsRed.addEventListener('click', function (ev) {
           var body = $('body');
           body.style.backgroundImage = "url('img/red.jpg')";
       }, false);

        settingsYellow.addEventListener('click', function (ev) {
            var body = $('body');
            body.style.backgroundImage = "url('img/yellow.png')";
        }, false);

        settingsBlue.addEventListener('click', function (ev) {
            var body = $('body');
            body.style.backgroundImage = "url('img/blue.jpg')";
        }, false);

        settingsGreen.addEventListener('click', function (ev) {
            var body = $('body');
            body.style.backgroundImage = "url('img/green.jpg')";
        }, false);

        var filters = makeArray($All('.filters li a'));
        filters.forEach(function(filter) {
            filter.addEventListener('click', function() {
                //将data的filter属性设为当前所选中的
                data.filter = filter.innerHTML;
                filters.forEach(function(filter) {
                    //取消所有filter的选中状态
                    filter.classList.remove(CL_SELECTED);
                });
                //只为当前选中的filter添加选中状态
                filter.classList.add(CL_SELECTED);
                update();
            }, false);
        });

        update();

    });
};


function update() {
    activeCount = 0;
    addItems();

    var data = model.data;
    var newTodo = $('.new-todo');
    newTodo.value = data.msg;
    var completedCount = data.items.length - activeCount;

    //设置下方剩余未完成事件数
    var todoCount = $('.todo-count');
    todoCount.innerHTML = 'left: ' + (activeCount || 'No');

    // var clearCompleted = $('.clear-completed');//清除已完成
    // clearCompleted.style.visibility = completedCount > 0 ? 'visible' : 'hidden';

    var toggleAll = $('.toggle-all');//获取前方勾选框
    toggleAll.style.visibility = data.items.length > 0 ? 'visible' : 'hidden';
    toggleAll.checked = data.items.length == completedCount;

    var filters = makeArray($All('.filters li a'));
    filters.forEach(function(filter) {
        if (data.filter == filter.innerHTML) filter.classList.add(CL_SELECTED);
        else filter.classList.remove(CL_SELECTED);
    });
}

function addItems() {
    model.flush();
    var data = model.data;

    var todoList = $('.todo-list');//获取放置todo list的div
    todoList.innerHTML = '';//每一次更新都重新获取数据，清空以前的数据

    data.items.forEach(function (itemData, index) {
       if(!itemData.completed) activeCount++;//计算总共未完成事件数目

       //list中需要显示的内容
       if(data.filter == 'All' ||
           (data.filter == 'Active' && !itemData.completed) ||
           (data.filter == 'Completed' && itemData.completed)){
           var item = document.createElement('li');
           var id = 'item' + itemID++;
           item.setAttribute('id', id);//为每一个事件设置唯一ID

           if(itemData.completed) item.classList.add(CL_COMPLETED);//如果已完成，需要改变显示样式

           item.innerHTML = [
               '<div class="view">',
               ' <input class="toggle" type="checkbox">',
               ' <label class="todo-label">' + itemData.msg + '</label>',
               '</div>'
           ].join('');

           var label = item.querySelector('.todo-label');//todolist的文字部分
           label.addEventListener('dblclick', function () {
               item.classList.add(CL_EDITING);

               console.log('double click here!');

               var edit = document.createElement('input');
               var finished = false;
               edit.setAttribute('value', label.innerHTML);
               edit.setAttribute('class', 'edit');
               edit.setAttribute('type', 'text');

               edit.addEventListener('keyup', function (ev) { //输入回车后改变list item
                   if(ev.keyCode == 13){
                       label.innerHTML = this.value;
                       itemData.msg = this.value;
                       update();
                   }
               }, false);

               //当光标移开，取消编辑，且不保存
               edit.addEventListener('blur', function (ev) {
                   finish();
               }, false);

               function finish() {
                   if(finished) return;
                   finished = true;
                   item.removeChild(edit);
                   item.classList.remove(CL_EDITING);
               }

               item.appendChild(edit);
               edit.focus();
           }, false);

           //获取每个item的文字部分
           var todoLabel = item.querySelector('.todo-label');
           var clickNum = 0;//点击次数
           var longTapTimer;
           todoLabel.addEventListener('touchstart', function (e) {
               clickNum ++;//每次点击，次数加一

               //如果0.5s内没有点击第二次，点击次数就会被清零
               longTapTimer = setTimeout(function () {
                   longTapTimer = null;
                   clickNum = 0;
               }, 500);

               //只有0.5s内连续点击，次数才有可能大于1，才可以满足if条件
               if(clickNum > 1){
                   item.classList.add(CL_EDITING);
                   var edit = document.createElement('input');
                   var finished = false;
                   edit.setAttribute('value', label.innerHTML);
                   edit.setAttribute('class', 'edit');
                   edit.setAttribute('type', 'text');

                   edit.addEventListener('keyup', function (ev) { //输入回车后改变list item
                       if(ev.keyCode == 13){
                           label.innerHTML = this.value;
                           itemData.msg = this.value;
                           update();
                       }
                   }, false);

                   //当光标移开，取消编辑，且不保存
                   edit.addEventListener('blur', function (ev) {
                       finish();
                   }, false);

                   function finish() {
                       if(finished) return;
                       finished = true;
                       item.removeChild(edit);
                       item.classList.remove(CL_EDITING);
                   }

                   item.appendChild(edit);
                   edit.focus();
               }
           }, false);

           var itemToggle = item.querySelector('.toggle');//获取前方勾选框
           itemToggle.checked = itemData.completed;//如果事件已完成，就勾选
           itemToggle.addEventListener('click', function (evt) {
               itemData.completed = !itemData.completed;
               update();
           }, false);

           var startX, startY, moveX, moveY;
           var removed = false;
           item.addEventListener('touchstart', function (e) {
               var touch = e.touches[0];
               //获取最初点击的坐标
               startX = touch.pageX;
               startY = touch.pageY;
           });
           item.addEventListener('touchend', function (e) {
               var item = e.target;
               //如果向右滑动距离大于200，则删除item
               if (moveX > 200 && !removed){
                   removed = true;
                   data.items.splice(index, 1);
                   update();
               }
               //如果向左滑动距离大于200，则置顶item
               if(moveX < -200 && !removed){
                   var tmp = data.items.splice(index, 1);
                   data.items.push(tmp[0]);
                   update();
               }
               //如果滑动后距离不够，则返回原来位置
               else if(!removed) {
                   // item.style.transform = 'translate(' + 0 + 'px, ' + 0 + 'px)';
                   // item.style.opacity = 1 ;
                   item.parentNode.style.transform = 'translate(' + 0 + 'px, ' + 0 + 'px)';
                   item.parentNode.style.opacity = 1 ;
               }

           });
           item.addEventListener('touchmove', function (e) {
               var touch = e.touches[0];
               var item = e.target;
               //获取滑动的距离
               moveX = touch.pageX - startX;
               moveY = touch.pageY - startY;

               //保证在横向滑动时才有作用
               if(Math.abs(moveY) < 10){
                   e.preventDefault();
                   // item.style.transform = 'translate(' + moveX + 'px, ' + 0 + 'px)';
                   // item.style.opacity = (1 - Math.abs(moveX) / 300).toFixed(1);
                   item.parentNode.style.transform = 'translate(' + moveX + 'px, ' + 0 + 'px)';
                   item.parentNode.style.opacity = (1 - Math.abs(moveX) / 300).toFixed(1);
               }
           });

           todoList.insertBefore(item, todoList.firstChild);

       }
    });
}

var makeArray = function(likeArray) {
    var array = [];
    for (var i = 0; i < likeArray.length; ++i) {
        array.push(likeArray[i]);
    }
    return array;
};

function initSpeechRecognition() {
    if('webkitSpeechRecognition' in window){
        var recognition = new webkitSpeechRecognition();
        var recording = false;
        recognition.continuous = false;
        recognition.lang = 'zh-CN';

        var voiceButton = $('.voice-button');
        var newTodo = $('.new-todo');

        recognition.onstart = function () {
            recording = true;
            console.log('on start now');
        };

        recognition.onend = function () {
            recording = false;
            console.log('on stop now');
            voiceButton.style.backgroundImage = "url('img/voice.png')";
        };

        recognition.onresult = function (ev){
            console.log('on result now');
            //获取结果，并写在输入框中
            newTodo.value = ev.results[0][0].transcript;
            console.log(ev.results[0][0].transcript);
            voiceButton.style.backgroundImage = "url('img/voice.png')";
        };

        voiceButton.addEventListener('click', function (ev) {
            console.log('here click');
            if(recording){
                console.log('click and recording');
                recording = false;
                //停止录音
                recognition.stop();
                voiceButton.style.backgroundImage = "url('img/voice.png')";
                return ;
            }
            console.log('click not recording');
            voiceButton.style.backgroundImage = "url('img/recognizing.png')";
            //开始录音
            recognition.start();
            recording = true;
        }, false);
    }
    else{
        console.warn('Chrome is needed!');
    }
}