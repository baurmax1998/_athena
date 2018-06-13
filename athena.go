package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	initialMigration()

	myRouter := mux.NewRouter().StrictSlash(true)

	staticFileDirectory := http.Dir("./web/")
	staticFileHandler := http.StripPrefix("/athena/", http.FileServer(staticFileDirectory))
	myRouter.PathPrefix("/athena/").Handler(staticFileHandler).Methods("GET")

	myRouter.HandleFunc("/tag", allTag).Methods("GET")
	myRouter.HandleFunc("/item", allItem).Methods("GET")
	myRouter.HandleFunc("/file", allFile).Methods("GET")
	myRouter.HandleFunc("/relation", allRelation).Methods("GET")

	myRouter.HandleFunc("/explorer/{tags}", explorer).Methods("GET")

	myRouter.HandleFunc("/tag/{name}", newTag).Methods("POST")
	myRouter.HandleFunc("/file/{name}/{extension}/{location}", newFile).Methods("POST")
	myRouter.HandleFunc("/relation/{file}/{tag}", newRelation).Methods("POST")

	myRouter.HandleFunc("/tag/{name}", findTag).Methods("GET")

	log.Fatal(http.ListenAndServe(":8080", myRouter))
}

func getDBName() string {
	return "./db/athena.db"
}

func initialMigration() {
	db, err := gorm.Open("sqlite3", getDBName())
	if err != nil {
		fmt.Println(err.Error())
		panic("failed to connect database")
	}
	defer db.Close()

	// Migrate the schema
	db.AutoMigrate(&Tag{})
	db.AutoMigrate(&Item{})
	db.AutoMigrate(&Relation{})
	db.AutoMigrate(&File{})
}

//Tag is great
type Tag struct {
	gorm.Model
	// TagID int    `sgorm:"primary_key;AUTO_INCREMENT"`
	Name string `gorm:"UNIQUE_INDEX;not null"`
}

//Item great
type Item struct {
	gorm.Model
	DType string
	// ItemID int `gorm:"primary_key;AUTO_INCREMENT"`
}

//File great
type File struct {
	gorm.Model
	ItemID    int
	Item      Item
	Name      string
	Extension string
	Location  string
}

//Relation grate
type Relation struct {
	TagID  uint
	Tag    Tag `gorm:"auto_preload"`
	ItemID uint
	Item   Item `gorm:"auto_preload"`
}

func newRelation(w http.ResponseWriter, r *http.Request) {
	db, err := gorm.Open("sqlite3", getDBName())
	if err != nil {
		panic("failed to connect database")
	}
	defer db.Close()

	vars := mux.Vars(r)
	file := vars["file"]
	tag := vars["tag"]

	var tagEntity Tag

	db.First(&tagEntity, stringToInt(tag))

	var fileEntity File
	db.Preload("item").First(&fileEntity, stringToInt(file))

	db.Create(&Relation{ItemID: uint(fileEntity.ItemID), TagID: uint(tagEntity.ID)})
	fmt.Fprintf(w, "New User Successfully Created")
}

type returnStruct struct {
	Tags  []Tag
	Files *[]File
}

func explorer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	searchTags := vars["tags"]

	db, err := gorm.Open("sqlite3", getDBName())
	if err != nil {
		panic("failed to connect database")
	}
	defer db.Close()

	type returnStruct struct {
		Tags  []Tag
		Files []File
	}

	var arr []string
	_ = json.Unmarshal([]byte(searchTags), &arr)
	if len(arr) == 0 {
		var tags []Tag
		db.Find(&tags)
		returnValue := returnStruct{Tags: tags}

		json.NewEncoder(w).Encode(returnValue)
	} else {

		// select *
		// from tags
		// where id in(
		// select tag_id
		// from relations
		// where item_id in (
		// select item_id
		// from relations
		// where tag_id in  ('1')
		// )
		// and tag_id not in ('1')
		// )
		// ;

		var tags []Tag
		db.Where("id in (?)",
			db.Table("relations").Select("tag_id").Where("item_id in (?)",
				db.Table("relations").Select("item_id").Where("tag_id in (?)",
					arr).QueryExpr()).Where("tag_id not in (?)",
				arr).QueryExpr()).Find(&tags)

		var files []File

		// select *
		// from files
		// where item_id in (
		// select item_id
		// from relations r
		// where tag_id in  ('1')
		// group by item_id
		// having count(tag_id) = 1
		// )
		// ;

		db.Where("item_id in (?)",
			db.Table("relations").Select("item_id").Where("tag_id in (?)",
				arr).Group("item_id").Having("count(tag_id) = ?",
				len(arr)).QueryExpr()).Find(&files)

		// db.Where("item_id in (?)",
		// 	db.Table("relations").Select("item_id").Where("tag_id in",
		// 		arr).Group("item_id").Having("count(tag_id) = ?",
		// 		len(arr)).QueryExpr()).Find(&files)

		returnValue := returnStruct{Tags: tags, Files: files}

		json.NewEncoder(w).Encode(returnValue)
	}

}

func newFile(w http.ResponseWriter, r *http.Request) {
	db, err := gorm.Open("sqlite3", getDBName())
	if err != nil {
		panic("failed to connect database")
	}
	defer db.Close()

	vars := mux.Vars(r)
	name := vars["name"]
	extension := vars["extension"]
	location := vars["location"]

	item := Item{DType: "F"}

	db.Create(&item)

	file := File{Name: name, Extension: extension, Location: location, ItemID: int(item.ID), Item: item}

	db.Create(&file)

	fmt.Fprintf(w, idToString(file.ID))
}

func findTag(w http.ResponseWriter, r *http.Request) {
	db, err := gorm.Open("sqlite3", getDBName())
	if err != nil {
		panic("failed to connect database")
	}
	defer db.Close()

	vars := mux.Vars(r)
	name := vars["name"]

	var tag Tag

	db.Where("name = ?", name).Find(&tag)

	json.NewEncoder(w).Encode(tag)
}

func idToString(u uint) string {
	return strconv.FormatUint(uint64(u), 10)
}

func stringToInt(u string) int {
	i, _ := strconv.ParseInt(u, 10, 32)
	return int(i)
}

func newTag(w http.ResponseWriter, r *http.Request) {
	db, err := gorm.Open("sqlite3", getDBName())
	if err != nil {
		panic("failed to connect database")
	}
	defer db.Close()

	vars := mux.Vars(r)
	name := vars["name"]

	fmt.Println(name)

	db.Create(&Tag{Name: name})
	fmt.Fprintf(w, "New User Successfully Created")
}

func allFile(w http.ResponseWriter, r *http.Request) {
	db, err := gorm.Open("sqlite3", getDBName())
	if err != nil {
		panic("failed to connect database")
	}
	defer db.Close()

	var files []File
	db.Find(&files)
	fmt.Println("{}", files)

	json.NewEncoder(w).Encode(files)
}

func allRelation(w http.ResponseWriter, r *http.Request) {
	db, err := gorm.Open("sqlite3", getDBName())
	if err != nil {
		panic("failed to connect database")
	}
	defer db.Close()

	var relations []Relation

	db.Preload("Tag").Preload("Item").Find(&relations)
	// fmt.Println("{}", tags)

	json.NewEncoder(w).Encode(relations)
}

func allTag(w http.ResponseWriter, r *http.Request) {
	db, err := gorm.Open("sqlite3", getDBName())
	if err != nil {
		panic("failed to connect database")
	}
	defer db.Close()

	var tags []Tag
	db.Find(&tags)
	// fmt.Println("{}", tags)

	json.NewEncoder(w).Encode(tags)
}

func allItem(w http.ResponseWriter, r *http.Request) {
	db, err := gorm.Open("sqlite3", getDBName())
	if err != nil {
		panic("failed to connect database")
	}
	defer db.Close()

	var items []Item
	db.Find(&items)
	fmt.Println("{}", items)

	json.NewEncoder(w).Encode(items)
}
