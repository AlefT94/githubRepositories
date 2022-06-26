import {Container, Form, SubmitButton, List,DeleteButton} from  './styles'
import {FaGithub, FaPlus, FaSpinner, FaBars, FaTrash} from 'react-icons/fa'
import { useState } from 'react'
import api from '../../services/api'
import { useCallback } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Main(){
  const [newRepo,setNewRepo] = useState('');
  const [repositorios,setRepositiorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = useCallback((e)=>{ 
    e.preventDefault();

    async function submit(){
      setLoading(true);
      setAlert(null)
      try{

        if(newRepo.trim()===''){
          throw new Error('Você precisa indicar um repositórios')
        }



        const response = await api.get(`repos/${newRepo}`);

        const hasRepo = repositorios.find(repo=> repo.name === newRepo);

        if(hasRepo){
          throw new Error('Repositório duplicado');
        }
    
        const data = {
          name: response.data.full_name,
        }
    
        setRepositiorios([...repositorios, data]);
        setNewRepo('');
      }catch(e){
        setAlert(true);
        console.error(e)
      }finally{
        setLoading(false)
      }
    }

    submit()
  
  }, [newRepo,repositorios])

  const handleDelete = useCallback((repo)=>{
    const find = repositorios.filter(r=> r.name !== repo);
    setRepositiorios(find);
  },[repositorios])

  const handleInputChange = (e)=>{
    setAlert(null)
    setNewRepo(e.target.value)
  }

  useEffect(()=>{
    const repoStorage = localStorage.getItem('repos');

    if(repoStorage){
      setRepositiorios(JSON.parse(repoStorage));
    }
  },[])
  
  useEffect(()=>{
    localStorage.setItem('repos', JSON.stringify(repositorios))
  },[repositorios])

  return(
    <Container>

      <h1>
        <FaGithub size={25} />
        Meus Repositorios
      </h1>

      <Form onSubmit={handleSubmit} error={alert}>
        <input 
        type='text' 
        placeholder='Adicionar Repositórios' 
        value={newRepo}
        onChange={handleInputChange}
        />

        <SubmitButton loading={loading ? 1 : 0}>
          {loading ? (
            <FaSpinner color='#FFF' size={14} />
          ) : (
            <FaPlus color='#FFF' size={14} />  
          )}
          
        </SubmitButton>
      </Form>

      <List>
          {repositorios.map(repo =>(
            <li key={repo.name}>
              <span>
                <DeleteButton onClick={()=>handleDelete(repo.name)}>
                  <FaTrash size={14}/>
                </DeleteButton>
                {repo.name}
                </span>
              <Link to={`/repositorio/${encodeURIComponent(repo.name)}`} > 
                <FaBars size={20}/>
              </Link> 
            </li>
          ))}
      </List>

    </Container>
  )
}