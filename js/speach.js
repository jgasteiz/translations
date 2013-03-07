
var speaches, categories;

$(function() {

    var Category = Backbone.Model.extend({
        defaults: function() {
            return {
                categoryId: '',
                name: '',
                weight: 999
            };
        }
    });

    var CategoryList = Backbone.Collection.extend({
        model: Category,
        localStorage: new Backbone.LocalStorage("category-backbone")
    });

    // Main view for Category model.
    var CategoryView = Backbone.View.extend({

        tagName: 'li',
        className: 'category',

        // TODO: move this to the html.
        template: _.template(
            '<div class="label-box" data-id="<%= categoryId %>">' +
                '<label data-lang="pl"><%= name %></label>' +
                '<i class="fui-new-16 edit"></i>' +
                '<i class="fui-cross-16 destroy"></i>' +
                '<input class="edit category" type="text" value="<%= name %>" />' +
            '</div>' +
            '<div>' +
                '<a class="btn cancel" href="#">Cancel</a>' +
                '<a class="btn btn-primary save" href="#">Save</a>' +
            '</div>'),

        events: {
            'click i.destroy'     : 'clear',
            'click i.edit'        : 'edit',
            'keypress .edit'      : 'updateOnEnter',
            'click a.cancel'      : 'cancel',
            'click a.save'        : 'close'
        },

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },

        render: function() {
            this.syncIds(this.model);
            this.$el.html(this.template(this.model.toJSON()));
            this.category = this.$('input.edit.category');
            this.video = this.$('.video');
            return this;
        },

        // Change the categoryId to the same internal id of the model
        syncIds: function(model) {
            model.set('categoryId', model.get('id'));
            model.save();
        },

        // Enables editing mode.
        edit: function(e) {
            this.$el.addClass('editing');
            this.category.focus();
        },

        // Close editing mode discarding changes.
        cancel: function() {
            this.category.val(this.model.get('name'));
            this.$el.removeClass("editing");
        },

        // Closes editing mode saving changes.
        close: function() {
            this.model.save({
                name: this.category.val()
            });
            this.$el.removeClass("editing");
        },

        // If enter key is pressed, the function close is called.
        updateOnEnter: function(e) {
            if (e.keyCode == 13) {
                this.close();
            }
        },

        // Destroy the speach
        clear: function() {
            if (confirm('You sure you want to delete this?')) {
                this.model.destroy();
            }
        }
    });

    // Main model.
    var Speach = Backbone.Model.extend({
        defaults: function() {
            return {
                speachId: '',
                speach: '',
                language: undefined,
                category: new Category,
                weight: 999
            };
        }
    });

    // Main collection. Using localstorage for now (everything stays in browser).
    var SpeachList = Backbone.Collection.extend({
        model: Speach,
        localStorage: new Backbone.LocalStorage("speach2-backbone")
    });

    // Main view for Speach model.
    var SpeachView = Backbone.View.extend({

        tagName: 'li',
        className: 'speach',

        // TODO: move this to the html.
        template: _.template(
            '<div class="label-box" data-id="<%= speachId %>">' +
                '<label data-lang="pl"><%= speach %></label>' +
                '<i class="fui-new-16 edit"></i>' +
                '<i class="fui-cross-16 destroy"></i>' +
                '<i class="fui-volume-16 sound"></i>' +
                '<input class="edit speach" type="text" value="<%= speach %>" />' +
                '<select class="category-selector"></select>' +
            '</div>' +
            '<div>' +
                '<a class="btn cancel" href="#">Cancel</a>' +
                '<a class="btn btn-primary save" href="#">Save</a>' +
            '</div>' +
            '<div class="video"></div>'),

        events: {
            'click i.destroy'     : 'clear',
            'click i.edit'        : 'edit',
            'keypress .edit'      : 'updateOnEnter',
            'click a.cancel'      : 'cancel',
            'click a.save'        : 'close',
            'click .label-box'    : 'play'
        },

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },

        render: function() {
            this.syncIds(this.model);
            this.$el.html(this.template(this.model.toJSON()));
            this.speach = this.$('input.edit.speach');
            this.categories = this.$('select.category-selector');
            this.video = this.$('.video');
            return this;
        },

        // Change the speachId to the same internal id of the model
        syncIds: function(model) {
            model.set('speachId', model.get('id'));
            model.save();
        },

        // Enables editing mode.
        edit: function(e) {
            this.$el.addClass('editing');
            this.speach.focus();
            $(this.categories).append($('<option>').text('Select a category'));
            categories.each(function(item) {
                $(this.categories).append($('<option>').text(item.get('name')));
            }, this);
            console.log(this.model.get('category'));
        },

        // Close editing mode discarding changes.
        cancel: function() {
            this.speach.val(this.model.get('speach'));
            this.$el.removeClass("editing");
        },

        // Closes editing mode saving changes.
        close: function() {
            this.model.save({
                speach: this.speach.val()
            });
            this.$el.removeClass("editing");
        },

        // If enter key is pressed, the function close is called.
        updateOnEnter: function(e) {
            if (e.keyCode == 13) {
                this.close();
            }
        },

        // Destroy the speach
        clear: function() {
            if (confirm('You sure you want to delete this?')) {
                this.model.destroy();
            }
        },

        // Embeds an html5 tag with audio content from google translate.
        play: function(e) {
            var args =
                {
                    tl: $(e.target).attr('data-lang'),
                    q: $(e.target).html()
                },
                url = 'http://translate.google.com/translate_tts?',
                query = $.param(args),
                compiled = _.template(
                '<video controls="" autoplay="" name="media">' +
                    '<source src="<%= url %><%= query %>" type="audio/mpeg">' +
                '</video>');
            this.video.html(compiled({
                url: url,
                query: query
            }));
        }
    });

    var AppView = Backbone.View.extend({

        el: $('#speachapp'),
        events: {
            'keypress input[type=text].new': 'createOnEnter',
            'click a.new.speach': 'createSpeach',
            'click a.new.category': 'createCategory',
            'sortupdate .sortable': 'updateWeight'
        },

        // TODO: improve this. It's making me cry :(
        updateWeight: function() {
            this.speaches.each(function(item) {
                var domElement = $('#speach-list li').find('div[data-id=' + item.id + ']'),
                    parentIndex = domElement.parent().index();
                item.save({weight: parentIndex});
            });
        },

        initialize: function() {
            this.speach = this.$('input[type=text].new.speach');
            this.category = this.$('input[type=text].new.category');

            this.speaches = new SpeachList();
            speaches = this.speaches;

            this.categories = new CategoryList();
            categories = this.categories;

            this.speaches.comparator = function (item) {
                return item.get('weight');
            },

            this.categories.comparator = function (item) {
                return item.get('weight');
            },

            this.listenTo(this.speaches, 'add', this.addOneSpeach);
            this.listenTo(this.speaches, 'reset', this.addAllSpeaches);
            this.listenTo(this.speaches, 'all', this.render);

            this.listenTo(this.categories, 'add', this.addOneCategory);
            this.listenTo(this.categories, 'reset', this.addAllCategories);
            this.listenTo(this.categories, 'all', this.render);

            this.footer = this.$('footer');
            this.main = this.$('#main');

            this.speaches.fetch();
            this.categories.fetch();
        },

        render: function() {
            if (this.speaches.length) {
                this.main.show();
            } else {
                this.main.hide();
            }
            $('.sortable').sortable('destroy').sortable();
        },

        // Render a speach.
        addOneSpeach: function(speach) {
            var view = new SpeachView({model: speach});
            this.$('#speach-list').append(view.render().el);
        },

        addOneCategory: function(category) {
            var view = new CategoryView({model: category});
            this.$('#category-list').append(view.render().el);
        },

        // Render all speaches
        addAllSpeaches: function() {
            this.speaches.each(this.addOneSpeach, this);
            this.speaches.sort();
        },

        // Render all categories
        addAllCategories: function() {
            this.categories.each(this.addOneCategory, this);
            this.categories.sort();
        },

        // Create a new speach when enter key is pressed.
        createOnEnter: function(e) {
            if (e.keyCode != 13) {
                return;
            }
            if ($(e.target).hasClass('speach')) {
                this.createSpeach();
            }
            else {
                this.createCategory();
            }
        },

        // Create a new speach.
        createSpeach: function() {
            if (!this.speach.val()) {
                return;
            }
            this.speaches.create({
                speach: this.speach.val()
            });
            this.speach.val('');
        },

        // Create a new category.
        createCategory: function() {
            if (!this.category.val()) {
                return;
            }
            this.categories.create({
                name: this.category.val()
            });
            this.category.val('');
        }

    });

    var App = new AppView();
});