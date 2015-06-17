# folders
SRC			= .
BUILD		= ./public/js/
NM			= ./node_modules
BIN			= $(NM)/.bin
VIEWS		= $(SRC)/views
PUBLIC  = ./public

# files
MAIN		= $(VIEWS)/app.js
MAPFILE = bundle.min.map

all: $(BUILD)/bundle.min.js # $(BUILD)/style.min.css

$(BUILD)/bundle.min.js: $(BUILD)/bundle.js
	@$(BIN)/uglifyjs $^	\
	-o $@	\
	-c -m	\
	--source-map $(BUILD)/$(MAPFILE)	\
	--source-map-url ./$(MAPFILE)	\
	--comments \
	--stats \

$(BUILD)/bundle.js: $(VIEWS)/* $(NM)/*
	@$(BIN)/browserify -t reactify -t envify $(MAIN) -o $@

# $(BUILD)/style.min.css: $(PUBLIC)/css/normalize.css $(PUBLIC)/css/skeleton.css $(PUBLIC)/css/custom.css
#	$(BIN)/cleancss $^ -o $@ -d

clean:
	@$(RM) $(BUILD)/*

.PHONY: all clean

# git pull --rebase origin master && git reset --hard origin/master && pm2 delete bughouse && NODE_ENV=production PORT=8008 DEBUG=bughouse:* pm2 start -x ./bin/server --name "bughouse"
