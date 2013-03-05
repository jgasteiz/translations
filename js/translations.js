
// Version 0.1 of a simple translation-organiser I'm doing for two reasons:
// 1. learning a few things in polish
// 2. learning backbone.js
// I've used http://backbonejs.org/examples/todos/index.html code as a base for
// this app.
$(function() {

    // Main model.
    var Translation = Backbone.Model.extend({
        defaults: function() {
            return {
                english: 'english word',
                polish: 'polish word'
            };
        }
    });

    // Main collection. Using localstorage for now (everything stays in browser).
    var TranslationList = Backbone.Collection.extend({
        model: Translation,
        localStorage: new Backbone.LocalStorage("translations-backbone")
    });

    // Main view for Translation model.
    var TranslationView = Backbone.View.extend({

        tagName: 'li',
        className: 'row',

        // TODO: move this to the html.
        template: _.template(
            '<div class="six columns label-box">' +
                '<label class="polish" data-lang="pl"><%= polish %></label>' +
                '<i class="icon-edit edit polish"></i>' +
                '<i class="icon-trash destroy"></i>' +
                '<input class="edit polish" type="text" value="<%= polish %>" />' +
            '</div>' +
            '<div class="six columns label-box">' +
                '<label class="english" data-lang="en"><%= english %></label>' +
                '<i class="icon-edit edit english"></i>' +
                '<i class="icon-trash destroy"></i>' +
                '<input class="edit english" type="text" value="<%= english %>" />' +
            '</div>' +
            '<div class="twelve columns">' +
                '<a class="secondary button cancel" href="#">Cancel</a>' +
                '<a class="button save" href="#">Save</a>' +
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
            this.$el.html(this.template(this.model.toJSON()));
            this.english = this.$('input.edit.english');
            this.polish = this.$('input.edit.polish');
            this.video = this.$('.video');
            return this;
        },

        // Enables editing mode.
        edit: function(e) {
            this.$el.addClass('editing');
            if ($(e.target).hasClass('english')) {
                this.english.focus();
            }
            else {
                this.polish.focus();
            }
        },

        // Close editing mode discarding changes.
        cancel: function() {
            this.english.val(this.model.get('english'));
            this.polish.val(this.model.get('polish'));
            this.$el.removeClass("editing");
        },

        // Closes editing mode saving changes.
        close: function() {
            this.model.save({
                english: this.english.val(),
                polish: this.polish.val()
            });
            this.$el.removeClass("editing");
        },

        // If enter key is pressed, the function close is called.
        updateOnEnter: function(e) {
            if (e.keyCode == 13) {
                this.close();
            }
        },

        // Destroy the translation
        clear: function() {
            if (confirm('You sure you want to delete this?')) {
                this.model.destroy();
            }
        },

        // Embeds an html5 tag with audio content from google translate.
        // TODO: fix polish. Not working fine yet (convert weird chars to some
        // valid format in urls).
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

        el: $('#translationsapp'),
        events: {
            'keypress .new': 'createOnEnter'
        },

        initialize: function() {
            this.english = this.$('.new.english');
            this.polish = this.$('.new.polish');

            this.translations = new TranslationList();

            this.listenTo(this.translations, 'add', this.addOne);
            this.listenTo(this.translations, 'reset', this.addAll);
            this.listenTo(this.translations, 'all', this.render);

            this.footer = this.$('footer');
            this.main = this.$('#main');

            this.translations.fetch();
        },

        render: function() {
            if (this.translations.length) {
                this.main.show();
            } else {
                this.main.hide();
            }
        },

        // Render a translation.
        addOne: function(translation) {
            var view = new TranslationView({model: translation});
            this.$('#translation-list').append(view.render().el);
        },

        // Render all translations.
        addAll: function() {
            this.translations.each(this.addOne, this);
        },

        // Create a new translation when enter key is pressed.
        // TODO: create a button for narrow view.
        createOnEnter: function(e) {
            if (e.keyCode != 13) {
                return;
            }
            if (!this.english.val() && !this.polish.val()) {
                return;
            }
            this.translations.create({
                english: this.english.val(),
                polish: this.polish.val()
            });
            this.english.val('');
            this.polish.val('');
        }

    });

    var App = new AppView();
});