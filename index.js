$(function(){
    "use strict";
    window.App = {
        Models: {},
        Collections: {},
        Views: {}
    };
    //---------------------------------
    window.template = function(id) {
        return _.template($('#'+id).html());
    };
    //---------------------------------
    App.Models.Task = Backbone.Model.extend({
        defaults: {
            title: '',
            status: false
        },
        changeStatus: function(){
           this.status = !this.get('status');
        },
        validate: function (attr, options) {
            if(!$.trim(attr.title)) {
                return 'Task must be correct';
            }
        }
    });
    App.Collections.Task = Backbone.Collection.extend({
        model: App.Models.Task,
        findStatusChecked: function() {
            return this.where({status: true});
        }
    });
    //---------------------------------
    App.Views.AddTask = Backbone.View.extend({
        el: '#addTask',
        events: {
            'submit': 'submit'
        },
        initialize: function (){

        },
        submit: function (e){
            e.preventDefault();
            var newTaskTitle = $(e.currentTarget).find('input[type=text]').val();
                if(newTaskTitle){
                    var newTask = new App.Models.Task({title: newTaskTitle},{validate:true});
                    this.collection.add(newTask);
                    this.$el.find('input[type=text]').val('');
                }
        }
    });
    //---------------------------------
    App.Views.Task = Backbone.View.extend({
        tagName: 'li',
        template: template('taskTemplate'),
        initialize: function (){
            this.model.on('change', this.render, this);
            this.model.on('destroy', this.remove, this);
        },
        render: function () {
            var template = this.template(this.model.toJSON());
            var status = this.model.get('status');
            this.$el.html(template);
            this.$el.find('input[type=checkbox]').attr('checked', status);
            if(status){
            	this.$el.find('lable').css({'text-decoration':'line-through'});
            }else{
            	this.$el.find('lable').css({'text-decoration':'none'});
            }
            return this;
        },
        events: {
            'click .btnDelete': 'deleteTask',
            'dblclick .taskTitle': 'dblClick',
            'submit': 'saveCorrect',
            'change .check': 'check',
            'mouseover': 'over',
            'mouseout': 'out',
            'focusout .inpTaskTitle': 'saveCorrect'
        },
        deleteTask: function (){
            this.model.destroy();
            updateDeleteList();
        },
        remove: function () {
            this.$el.remove();
        },
        dblClick: function (e){
            var oldTask = this.$el.find('lable').text();
            hideByEl('button', this);
            hideByEl('lable', this);
            showByEl('form', this);
            $('.inpTaskTitle').val(oldTask);
           $('.inpTaskTitle').focus();
        },
        saveCorrect: function (e){
            e.preventDefault();
            var newTask =this.$el.find('input[type=text]').val();
            this.model.set({'title': newTask },{validate:true});
            hideByClassEl('.act', this);
            showByEl('lable', this);

        },
        check: function(){
            var status = this.model.get('status');
            this.model.set({'status': !status});
            updateDeleteList();
        },
        over: function (){
        	if(this.$el.find('lable').css('display')!=='none'){
                showByEl('button', this);
        	}
        },
        out: function (){
            hideByEl('button', this);
        }
    });
    //---------------------------------
    App.Views.Tasks = Backbone.View.extend({
        tagName: 'ul',
        initialize: function (){
            this.collection.on('add',this.addOne, this);
            this.collection.on({'change':this.itemLeft,'add':this.itemLeft,'remove':this.itemLeft});
        },
        render: function (){
            this.collection.each(this.addOne, this);
            return this;
        },
        itemLeft: function (){
            if(tasksCollection.length>0){
                showByClassEl('.taskCount', this);
                showByClassEl('.chooseDiv', this)
            }
            else{
                hideByClassEl('.taskCount', this);
                hideByClassEl('.chooseDiv', this);
            }
            if(tasksCollection.findStatusChecked().length>0){
                showByClassEl('.btnClean');
            }
            else{
                hideByClassEl('.btnClean');
            }
            var left = tasksCollection.length-tasksCollection.findStatusChecked().length;
            $('.taskCount').html(''+ left +' item left');
            updateDeleteList();
        },
        addOne: function (task){
            var taskView = new App.Views.Task({model:task});
            this.$el.append(taskView.render().el);
        }

    });
        //------------------------------------------
    App.Views.Footo = Backbone.View.extend ({
        el: 'div .footer',
        events: {
            'click .btnClean': 'clean'
        },
        clean: function (){
            _.invoke(tasksCollection.findStatusChecked(), 'destroy');
            $('.choose').attr('checked', false);

        }
    });
    //---------------------------------
    function updateDeleteList (){
        var countComplete = tasksCollection.findStatusChecked().length;
        var btn = $('.btnClean');
        if(countComplete>0){
            btn.html('Clear '+countComplete+' completed item');
        }
    };
    function showByEl(el, that){
        that.$el.find(el).css({'display': 'inline'});
    };
    function hideByEl(el, that){
        that.$el.find(el).css({'display': 'none'});
    }
    function showByClassEl(el){
        $(el).css({'display': 'inline'});
    };
    function hideByClassEl(el){
        $(el).css({'display': 'none'});
    }



    //---------------------------------------
    var tasksCollection = new App.Collections.Task(
        //[
        //    {
        //        title: 'Go to shop',
        //    },
        //    {
        //        title: 'Go at work',
        //    },
        //    {
        //        title: 'Go home',
        //    }
        //]
    );
    //---------------------------------
    var tasksView = new App.Views.Tasks({collection: tasksCollection});
    var addTaskView = new App.Views.AddTask({collection: tasksCollection});
    var footo = new App.Views.Footo();
    $('.tasks').html(tasksView.render().el);
    $('.chooseDiv').on('change', function (){;
    	if($('.choose').is(':checked')){
            tasksCollection.each(function(currentTask){
                currentTask.set({'status': true});
            });
    	}
    	else{
            tasksCollection.each(function(currentTask) {
                currentTask.set({'status': false});
            });
    	}
    });

});
