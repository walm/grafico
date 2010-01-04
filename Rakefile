require 'rubygems'

desc 'Packages Ico'
task :package => [:require_compiler] do
  sources  = ['base', 'line', 'bar', 'spark']
  packaged = File.join(File.dirname(__FILE__), 'packaged', 'ico.min.js')

  contents = sources.map do |source|
    file = File.join(File.dirname(__FILE__), 'source', "ico.#{source}.js")
    File.read(file)
  end.join("\n")

  File.open(packaged, "w") do |f|
    f.write Closure::Compiler.new.compile(contents)
  end
end

task :require_compiler do
  begin
    require 'closure-compiler'
  rescue LoadError
    puts "Install closure-compiler:"
    puts "sudo gem install closure-compiler --source http://gemcutter.org"
    abort
  end
end