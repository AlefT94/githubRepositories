import { useEffect, useState } from 'react';
import {useParams} from 'react-router-dom';
import {Container, Loading, Owner, BackButton, IssuesList, PageActions, FilterState} from './styles';
import {FaArrowLeft} from 'react-icons/fa'
import api from '../../services/api';


export default function Repositorio(){
  //buscando o parâmetro repositorio delcarado no routes.js
  let {repositorio} = useParams();

  const [repo, setRepo] = useState({});
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [issueState, setIssueState] = useState('open');
  
  useEffect(()=>{
    async function load(){
      //faz as duas consultas ao mesmo tempo
      const [repositorioData, issuesData] =  await Promise.all([
        api.get(`/repos/${repositorio}`),
        api.get(`/repos/${repositorio}/issues`,{
          params:{
            state: issueState,
            per_page: 5
          }
        })
      ])

      setRepo(repositorioData.data)
      setIssues(issuesData.data)
      setLoading(false)
    }

    load()

  },[])

  useEffect(()=>{

    async function loadIssue(){
      const response = await api.get(`/repos/${repositorio}/issues`,{
        params:{
          state: issueState,
          page,
          per_page: 5,
        },
      })
      setIssues(response.data)
    }

    loadIssue()

  },[page, repositorio, issueState])
  
  function handlePage(action){
    setPage(action === 'back' ? page - 1 : page + 1)
  }

  function handdleIssueState(state){
    setIssueState(state);
    setPage(1)
  }

  if(loading){
    return(
      <Loading>
        <h1>Carregando...</h1>
      </Loading>
    )
  }
  
  return(
    <Container>
      <BackButton to="/">
        <FaArrowLeft size={30} color='#000'/>
      </BackButton>
      <Owner>
        <img src={repo.owner.avatar_url} alt={repo.owner.login} />
        <h1>{repo.name}</h1>
        <p>{repo.description}</p>
      </Owner>
      
      <FilterState>
        <button 
        type='button' 
        onClick={()=>handdleIssueState('open')} 
        disabled={issueState === 'open'}>
          Open
        </button>
        <button 
        type='button' 
        onClick={()=>handdleIssueState('closed')} 
        disabled={issueState === 'closed'}>
          Closed
        </button>
        <button 
        type='button' 
        onClick={()=>handdleIssueState('all')} 
        disabled={issueState === 'all'}>
          All
        </button>
      </FilterState>

      <IssuesList>
        {issues.map(issue =>(
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login}/>

            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>

                {issue.labels.map(label=>(
                  <span key={String(label.id)}>{label.name}</span>
                ))}
              </strong>
              
              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
      </IssuesList>

      <PageActions>
        <button 
        type='button'
        onClick={()=>handlePage('back')} 
        disabled={page < 2}>
          Voltar
        </button>

        <button type='button' onClick={()=>handlePage('next')} >
          Próximo
        </button>
      </PageActions>
    </Container>
  )
}