package utils

import (
	"log"
	"os"
)

type CustomLogger struct {
	*log.Logger
}

var Logger *CustomLogger

func InitializeLogger() {
	Logger = &CustomLogger{
		Logger: log.New(os.Stdout, "", log.Ldate|log.Ltime|log.Lshortfile),
	}
}

func (l *CustomLogger) Infof(v ...interface{}) {
	l.SetPrefix("INFO: ")
	l.Println(v...)
}

func (l *CustomLogger) Errorf(format string, v ...interface{}) {
	l.SetPrefix("ERROR: ")
	l.Printf(format, v...)
}
