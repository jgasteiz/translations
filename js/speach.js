
$(function() {

    // Main model.
    var Speach = Backbone.Model.extend({
        defaults: function() {
            return {
                speach: 'the text',
                language: undefined
            };
        }
    });

    // Main collection. Using localstorage for now (everything stays in browser).
    var SpeachList = Backbone.Collection.extend({
        model: Speach,
        localStorage: new Backbone.LocalStorage("speach-backbone")
    });

    // Main view for Speach model.
    var SpeachView = Backbone.View.extend({

        tagName: 'li',
        className: 'row-fluid',

        // TODO: move this to the html.
        template: _.template(
            '<div class="label-box">' +
                '<label data-lang="pl"><%= speach %></label>' +
                '<i class="fui-new-16 edit"></i>' +
                '<i class="fui-cross-16 destroy"></i>' +
                '<i class="fui-volume-16 sound"></i>' +
                '<input class="edit speach" type="text" value="<%= speach %>" />' +
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
            this.$el.html(this.template(this.model.toJSON()));
            this.speach = this.$('input.edit.speach');
            this.video = this.$('.video');
            return this;
        },

        // Enables editing mode.
        edit: function(e) {
            this.$el.addClass('editing');
            this.speach.focus();
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
            'keypress .new': 'createOnEnter',
            'click a.new': 'create'
        },

        initialize: function() {
            this.speach = this.$('.new.speach');

            this.speachs = new SpeachList();

            this.listenTo(this.speachs, 'add', this.addOne);
            this.listenTo(this.speachs, 'reset', this.addAll);
            this.listenTo(this.speachs, 'all', this.render);

            this.footer = this.$('footer');
            this.main = this.$('#main');

            this.speachs.fetch();
        },

        render: function() {
            if (this.speachs.length) {
                this.main.show();
            } else {
                this.main.hide();
            }
        },

        // Render a speach.
        addOne: function(speach) {
            var view = new SpeachView({model: speach});
            this.$('#speach-list').append(view.render().el);
        },

        // Render all speachs.
        addAll: function() {
            this.speachs.each(this.addOne, this);
        },

        // Create a new speach when enter key is pressed.
        createOnEnter: function(e) {
            if (e.keyCode != 13) {
                return;
            }
            if (!this.speach.val()) {
                return;
            }
            this.create();
        },

        // Create a new speach.
        create: function() {
            this.speachs.create({
                speach: this.speach.val()
            });
            this.speach.val('');
        }

    });

    var App = new AppView();
});