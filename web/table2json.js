(function($) {

    $.fn.makeTableDownloadable = function() {

        return this.each(function() {

            var header = [];

            var tableAsJson = [];

            $(this).find("th").each(function() {
                header.push($(this).text());
            });

            $(this).find("tbody").find("tr").each(function() {
                var columElem = {};
                var array = $(this).find("td");

                for (let i = 0; i < array.length; i++) {
                    const element = $(array[i]);
                    columElem[header[i]] = element.html();
                }
                tableAsJson.push(columElem);
            });

            $(this).on("click", function() {
                var dataStr = "data:text/json;charset=utf-8," +
                    encodeURIComponent(JSON.stringify(tableAsJson));

                var a = $("<a>")
                    .attr("href", dataStr)
                    .attr("download", "scene.json")
                    .text("download");
                a.insertBefore($(this));
            });
        });

    };

}(jQuery));