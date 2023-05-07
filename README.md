# tabber

A simple Chrome extension to organize tabs, windows, and groups. 

This is a **WIP** not released yet, using it may hurt your tabs. 

## Why? 
I am a mess, I deal with 100+ tabs weekly. And I was annoyed that I couldn't find a good tab organizer that would allow me to kill all tabs matching a search and/or regex. 

## Features

Here's a list of the main features:

* [ ] Search for tabs and titles 
  * [ ] Group search results
  * [ ] Close search results
* [ ] Group all tabs
* Context menu
  * [ ] Group all tabs with a matching URL
  * [ ] Close all duplicates
* [ ] Close duplicates

## How it works

* Click or use `ctrl + u` or `cmd + u` to open it
* Some stats show up
* It will be ready to search
  * Counts tabs in search
  * Groups all tabs matching in the same window 


## Valid searches

These should be valid searches. Searches are not case sensitive. 

`* -word`
Give me all tabs that doesn't have `word`.

`*`
Give me all tabs

`twitter -elon`
Give me all tabs with the word `twitter` ron the title and/or URL and exclude tabs with the word `elon`.

`linkedin john`
Give me all tabs that have both words `linkedin` and `john`, but not necessarily together.

`link*` 
Give me all tabs that have words that start with `link`, that would include `linkedin` for example. 


<img width="400" alt="image" src="https://user-images.githubusercontent.com/1311402/233271063-c68c70e7-338b-4fa1-b6cd-fd5ddb23dd5f.png">
