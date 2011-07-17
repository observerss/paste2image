#!/usr/bin/env python
#coding:utf-8
from settings import *
from mongoengine import connect
connect("paste2image",host=DB_HOST,port=DB_PORT)

from models import Pasted

import tornado.wsgi
import tornado.httpserver
import tornado.httpclient
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.template
import json
import logging
import os

from multiprocessing import Pool

from tornado.options import define, options
define("port", default=8888, help="run on the given port", type=int)

loader = tornado.template.Loader("templates")

def text2image(pid,content,language,style,font_name,font_size,line_numbers,hl_lines):
    from pygments import highlight
    from pygments.lexers import get_lexer_by_name
    from cjkimg import ImageFormatter
    from StringIO import StringIO
    #from unicode_remap import convert see descriptions in unicode_remap

    try:
        #content = convert(content)
        p = Pasted.objects.get(pid=pid)
        image_formatter = ImageFormatter(
                image_format="png",
                style=style,
                font_name=font_name,
                font_size=font_size,
                line_numbers=line_numbers,
                hl_lines=hl_lines
        )
        result = highlight(
            content,
            get_lexer_by_name(language),
            image_formatter
        )
        p.image.put( result, filename="%s.png"%p.pid, content_type="image/png" ) 
        p.save()
    except Exception,what:
        logging.error(repr(what))
    return p.pid

class PasteHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        p = Pasted()
        p.content = self.get_argument("content","")
        p.save()

        lines = p.content.split('\n')
        
        auto_newline = self.get_argument("auto_newline",True)
        linebreak = self.get_argument("line_break",80)

        if auto_newline:
            newlines = []
            for line in lines:
                prefix = ''
                if line.startswith('^^'):
                    prefix = '^^'
                if prefix:
                    newlines.append(prefix+line[2:linebreak])
                else:
                    newlines.append(prefix+line[:linebreak])
                while len(line)>linebreak:
                    line = line[linebreak:]
                    newlines.append(prefix+line[:linebreak])
            lines = newlines

        hl_lines = []
        newlines = []
        for i in range(len(lines)):
            if lines[i].startswith('^^'):
                newlines.append(lines[i][2:])
                hl_lines.append(i+1)
            else:
                newlines.append(lines[i])
        lines = newlines

        pool = self.application.settings.get('pool')
        pool.apply_async( text2image, 
            (
                p.pid,
                '\n'.join(lines),
                self.get_argument("language","text"),
                self.get_argument("style","default"),
                self.get_argument("font_name","DejaVu Sans YuanTi Mono"),
                self.get_argument("font_size",14),
                self.get_argument("line_numbers",False),
                hl_lines,
            ),
            callback = self.on_processed
        )

    def on_processed(self,pid):
        self.redirect("/view/%s"%pid)

def file_read(pid):
    try:
        import gridfs,pymongo
        fs = gridfs.GridFS(pymongo.Connection("%s:%s"%(DB_HOST,DB_PORT))[DB_NAME])
        f = fs.get_version(filename="%s.png"%pid)
        data = f.read()
        content_type = "image/png"
        return content_type,data
    except Exception,what:
        logging.error(repr(what))
        return '',''


class ViewImageHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self,thepid):
        pid,sep,name = thepid.rpartition(".")
        if not sep:
            imglink = "/view/"+thepid.split('.')[0]+".png"
            print imglink
            html = loader.load("pasted.html").generate(imglink=imglink,pid=thepid.split('.')[0])
            self.finish(html)
            return
        pool = self.application.settings.get('pool')
        pool.apply_async(file_read,(pid,),callback=self.on_read) 
    
    def on_read(self,data):
        content_type,data = data
        self.set_header('Content-Type',content_type)
        self.finish(data)

class RawTextHandler(tornado.web.RequestHandler):
    def get(self,pid):
        try:
            self.set_header('Content-Type','text/plain; charset=utf-8')
            p = Pasted.objects.get(pid=pid)
            self.write(p.content)
        except:
            self.write('')

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        html = loader.load("paste.html").generate()
        self.write(html)

def main():
    tornado.options.parse_command_line()
    application = tornado.web.Application([
        (r"/view/(.*)", ViewImageHandler),
        (r"/paste", PasteHandler),
        (r"/rawtext/(.*)",RawTextHandler),
        (r"/", MainHandler),
    ],
        static_path=os.path.join(os.path.dirname(__file__),"static"),
        pool=Pool(2),
        debug=True
    )
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()

