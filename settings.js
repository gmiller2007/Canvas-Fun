module.exports = function settings_function() {
    var settings = {

        /***
        * Directories and filepaths
        */
        project_directory:  __dirname,
        views_directory: __dirname+"/views",
        static_directory: __dirname+"/static",
        favicon_path: __dirname+"/static/img/favicon-16.ico",
        routes_path: __dirname+"/routes.js",
        models_path: __dirname+"/models.js",
        colors_path: __dirname+"/colors.js",

        /***
        * Web server settings
        */
        port_http: 8000,
        port_sockets: 3000,
        session_key: "p2(236cVb3S#a,25gffDxrR|tb{{bddR31aAz35917",

        /***
        * Database server settings
        */
        database_host: "127.0.0.1",
        database_port: 27017,
        mongodb_options: {
            user: "cards_user_xd43hgEdjRLfks33gfddsw3",
            pass: "cards_password_j3#5gfd343wxzZs",
            server: { poolSize: 5 }
        }
    }
    return settings;
}
