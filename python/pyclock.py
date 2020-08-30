#!/usr/bin/env python
import getopt
import os
import string
import sys

from ivy.std_api import *
import random


IVYAPPNAME = 'fakeRejeu'
compteur=0

class time:
    def __init__(self,h = 8,m = 0, s=0):
        self.h = h
        self.m = m
        self.s = s
    def up(self):
        if ( self.s == 59 ):
           self.s=0
           if ( self.m == 59 ):
              self.m=0
              if ( self.h == 23 ):
                 self.h=0
              else:
                 self.h=self.h+1
           else:
              self.m=self.m+1
        else:
           self.s=self.s+1
    def __str__(self):
        return "%s:%s:%s" % (self.h,self.m,self.s)

clock=time()

class track:
    def __init__(self,id = 1,callsign="AFR000",ssr=2000,sector="AI",layer="UP",x = 0,y = 0, afl = 300, vx=200,vy=200,rate=0,heading=0,groundspeed=200,tendency=0,time="08:00:00"):
        self.id = id
        self.x = x
        self.y = y
        self.afl = afl
        self.callsign=callsign
        self.sector=sector
        self.ssr=ssr
        self.layer=layer
        self.vx=vx
        self.vy=vy
        self.rate=rate
        self.heading=heading
        self.groundspeed=groundspeed
        self.tendency=tendency
        self.time=time
        self.mt=random.randint(1,4)
    def move(self):
        lonm=0
        latm=0
        if (self.mt==2):
            lonm=self.vx*1.5/3600
        if (self.mt==4):
            lonm=-self.vx*1.5/3600 
        if (self.mt==1):
            latm=-self.vy*1.5/3600 
        if (self.mt==3):
            latm=-self.vy*1.5/3600 
        self.x=self.x+lonm
        self.y=self.y+latm
    def __str__(self):
        return "TrackMovedEvent Flight=%s CallSign=%s Ssr=%s Sector=%s Layer=%s X=%s Y=%s Vx=%s Vy=%s Afl=%s Rate=%s Heading=%s GroundSpeed=%s Tendency=%s Time=%s" % (self.id,self.callsign,self.ssr,self.sector,self.layer,self.x,self.y,self.vx,self.vy,self.afl,self.rate,self.heading,self.groundspeed,self.tendency,self.time)
t1=track()
def lprint(fmt, *arg):
    print(IVYAPPNAME + ': ' + fmt % arg)

def trackEvent():
    global t1
    t1.move()
    return str(t1)

def barEvent():
    ret="BarEvent "
    ret=ret+str(random.randint(1,64))
    for i in range(0,7) :
        ret=ret+" "+str(random.randint(1,64))
    return ret

def usage(scmd):
    lpathitem = string.split(scmd, '/')
    fmt = '''Usage: %s [-h] [-b IVYBUS | --ivybus=IVYBUS]
    where
    \t-h provides the usage message;
    \t-b IVYBUS | --ivybus=IVYBUS allow to provide the IVYBUS string in the form
    \t adresse:port eg. 127.255.255.255:2010
    '''
    print(fmt % lpathitem[-1])


def oncxproc(agent, connected):
    if connected == IvyApplicationDisconnected:
        lprint('Ivy application %r was disconnected', agent)
    else:
        lprint('Ivy application %r was connected', agent)
        global compteur
        IvySendMsg("ClockEvent time="+str(compteur))
    lprint('currents Ivy application are [%s]', IvyGetApplicationList())


def ondieproc(agent, _id):
    lprint('received the order to die from %r with id = %d', agent, _id)


def onmsgproc(agent, *larg):
    lprint('Received from %r: [%s] ', agent, larg[0])


def upcompteur(agent, *larg):
    """
    global compteur
    compteur=compteur+1
    """
    global clock
    clock.up()
    IvySendMsg("ClockEvent time="+str(clock))

def bars(agent, *larg):
    barStr=barEvent()	
    IvySendMsg(barStr)

def tracks(agent, *larg):
    trackStr=trackEvent()   
    IvySendMsg(trackStr)

if __name__ == '__main__':
    # initializing ivybus and isreadymsg
    sivybus = ''
    sisreadymsg = '[%s is ready]' % IVYAPPNAME
    # getting option
    try:
        optlist, left_args = getopt.getopt(sys.argv[1:], 'hb:', ['ivybus='])
    except getopt.GetoptError:
        # print help information and exit:
        usage(sys.argv[0])
        sys.exit(2)
    for o, a in optlist:
        if o in ('-h', '--help'):
            usage(sys.argv[0])
            sys.exit()
        elif o in ('-b', '--ivybus'):
            sivybus = a
    if sivybus:
        sechoivybus = sivybus
    elif 'IVYBUS' in os.environ:
        sechoivybus = os.environ['IVYBUS']
    else:
        sechoivybus = 'ivydefault'
    lprint('Ivy will broadcast on %s ', sechoivybus)

    # initialising the bus
    IvyInit(IVYAPPNAME,     # application name for Ivy
            sisreadymsg,    # ready message
            0,              # main loop is local (ie. using IvyMainloop)
            oncxproc,       # handler called on connection/disconnection
            ondieproc)      # handler called when a <die> message is received

    # starting the bus
    # Note: env variable IVYBUS will be used if no parameter or empty string
    # is given ; this is performed by IvyStart (C)
    IvyStart(sivybus)
    # binding to every message
    IvyBindMsg(onmsgproc, '(.*)')
     # binding on dedicated message : starting with 'hello ...'
    IvyBindMsg(upcompteur, '^getCompteur')
    IvyBindMsg(bars, '^getBars')
    IvyBindMsg(tracks,'^getTracks')
    lprint('%s doing IvyMainLoop', IVYAPPNAME)
    IvyMainLoop()
