fis.config.set('namespace', 'common');
fis.config.set('pack', {
    '/static/async.js': 'widget/async**.js'
});

fis.config.set('modules.postpackager', function(ret, conf, settings, opt){
    var map = ret.map;
    var _ = fis.util;
    var result = {
        res: {},
        pkg: {}
    };

    function next(id, obj, type) {
        var info = fis.util.clone(obj);
        if (info['type'] == 'js') {
            info['url'] = info['uri'];

            delete info['extras'];
            delete info['uri'];
            delete info['type'];

            result[type][id] = info; 
        }
    }

    //res
    _.map(map.res, function(id, obj) {
        next(id, obj, 'res');
    });
    //pkg
    _.map(map.pkg, function(id, obj) {
        next(id, obj, 'pkg');
    });

    var file = fis.file.wrap(fis.project.getProjectPath() + '/static/fis_resource_map.js');
    file.setContent('require.resourceMap('+JSON.stringify(result)+');');
    ret.pkg[file.subpath] = file;

    var url = file.getUrl(opt.hash, opt.domain);

    _.map(ret.src, function (subpath, file) {
        if (file.extras && file.extras.isPage) {
            var content = file.getContent();
            if (/\{%html/.test(content)) {
                content = '{%$fis_res_map_url[]="'+url+'"%}'+content;
            } else if (/\{%extends/.test(content)) {
                var p = content.indexOf('{%/block%}');
                content = content.substring(0, p) + '{%$fis_res_map_url[]="'+url+'"%}' + content.substring(p);
            } else {
                content = '{%$fis_res_map_url[]="'+url+'"%}'+content;
            }

            file.setContent(content);
        }
    });
});