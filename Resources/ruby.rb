require 'base64'

def write_bin_file(path, data)
  data.sub!("data:image/png;base64,","");  
  new_data = Base64.decode64(data)

  File.open(path, 'wb') do |f|
    f.write(new_data)
  end
  
  return path
end